import net from "net";
import type { DeviceScanResult, RiskLevel } from "@/types";
import { isForbiddenAddress, resolveHost } from "@/lib/server/net-guard";

/** Common ports checked by a device reachability scan. `risky` = should not normally be exposed. */
const PORTS: { port: number; service: string; risky: boolean; severity?: RiskLevel }[] = [
  { port: 21, service: "FTP", risky: true, severity: "high" },
  { port: 22, service: "SSH", risky: false },
  { port: 23, service: "Telnet", risky: true, severity: "critical" },
  { port: 80, service: "HTTP", risky: false },
  { port: 443, service: "HTTPS", risky: false },
  { port: 445, service: "SMB", risky: true, severity: "critical" },
  { port: 3306, service: "MySQL", risky: true, severity: "high" },
  { port: 3389, service: "RDP", risky: true, severity: "high" },
  { port: 5432, service: "PostgreSQL", risky: true, severity: "high" },
  { port: 5900, service: "VNC", risky: true, severity: "high" },
  { port: 8080, service: "HTTP-alt", risky: false },
];

const TIMEOUT_MS = 1500;
const RANK: Record<RiskLevel, number> = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };

function tryConnect(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(TIMEOUT_MS, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

/**
 * TCP connect check against common ports on the device, run from the CyberGuard
 * server. A device that only answers on private LAN addresses is unreachable
 * from a cloud deployment and will be reported as not responding.
 */
export async function probeHost(hostOrIp: string): Promise<DeviceScanResult> {
  const started = Date.now();
  const base = {
    target: hostOrIp,
    checkedPorts: PORTS.map((p) => p.port),
    scannedAt: new Date().toISOString(),
  };

  let address: string;
  try {
    const addrs = await resolveHost(hostOrIp.trim());
    if (addrs.some(isForbiddenAddress)) {
      return {
        ...base, reachable: false, openPorts: [], riskLevel: "info",
        error: "Loopback, link-local and multicast addresses can't be scanned",
        durationMs: Date.now() - started,
      };
    }
    address = addrs[0];
  } catch (err) {
    return {
      ...base, reachable: false, openPorts: [], riskLevel: "info",
      error: (err as Error).message, durationMs: Date.now() - started,
    };
  }

  const results = await Promise.all(
    PORTS.map(async (p) => ({ ...p, open: await tryConnect(address, p.port) }))
  );
  const openPorts = results
    .filter((r) => r.open)
    .map((r) => ({ port: r.port, service: r.service, risky: r.risky }));

  let riskLevel: RiskLevel = openPorts.length ? "low" : "info";
  for (const r of results) {
    if (r.open && r.risky && r.severity && RANK[r.severity] > RANK[riskLevel]) {
      riskLevel = r.severity;
    }
  }

  return {
    ...base,
    resolvedAddress: address,
    reachable: openPorts.length > 0,
    openPorts,
    riskLevel,
    durationMs: Date.now() - started,
  };
}
