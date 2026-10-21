import { lookup } from "dns/promises";
import net from "net";

/** True for loopback, link-local (incl. cloud metadata), unspecified and multicast addresses. */
export function isForbiddenAddress(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 127 || (a === 169 && b === 254) || a >= 224;
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isForbiddenAddress(v.slice(7));
    return v === "::" || v === "::1" || v.startsWith("fe8") || v.startsWith("fe9") ||
      v.startsWith("fea") || v.startsWith("feb") || v.startsWith("ff");
  }
  return true;
}

/** True for RFC1918 / unique-local / CGNAT addresses. */
export function isPrivateAddress(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127);
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return v.startsWith("fc") || v.startsWith("fd");
  }
  return false;
}

/** Resolve a hostname (or pass through an IP). Throws with a readable message on failure. */
export async function resolveHost(host: string): Promise<string[]> {
  const h = host.replace(/^\[|\]$/g, "");
  if (net.isIP(h)) return [h];
  try {
    const res = await lookup(h, { all: true });
    return res.map((r) => r.address);
  } catch {
    throw new Error(`Could not resolve ${host}`);
  }
}
