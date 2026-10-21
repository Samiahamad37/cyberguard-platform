"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Laptop,
  Monitor,
  Server,
  Smartphone,
  Cpu,
  ScanSearch,
  Trash2,
  Eye,
  Plus,
  Pencil,
  MonitorSmartphone,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/shared/risk-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Device } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  createDevice,
  deleteDevice,
  fetchDevices,
  scanDevice,
  updateDevice,
  type DeviceInput,
} from "@/services/platform.service";

const EMPTY_FORM: DeviceInput = { name: "", os: "", type: "laptop", ipAddress: "" };
const DESCRIPTION = "Your device inventory, with reachability and exposed-port checks";

const typeIcon = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  server: Server,
  iot: Cpu,
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Device | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DeviceInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (device: Device) => {
    setEditingId(device.id);
    setForm({
      name: device.name,
      os: device.os,
      type: device.type,
      ipAddress: device.ipAddress,
    });
    setFormOpen(true);
  };

  const saveDevice = async () => {
    if (!form.name.trim() || !form.ipAddress.trim()) {
      toast.error("Enter a name and an IP address or hostname");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateDevice(editingId, form);
        setDevices((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
        toast.success("Device updated");
      } else {
        const created = await createDevice(form);
        setDevices((prev) => [...prev, created]);
        toast.success("Device added");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchDevices()
      .then((data) => {
        if (!cancelled) setDevices(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load devices");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runScan = async (id: string) => {
    setScanningId(id);
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "scanning" } : d))
    );
    try {
      const updated = await scanDevice(id);
      setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (selected?.id === id) setSelected(updated);
      const r = updated.lastScanResult;
      if (r?.error) toast.error(`Scan failed: ${r.error}`);
      else if (!r?.reachable) toast.warning("Device did not respond on any checked port");
      else toast.success(`Scan complete: ${r.openPorts.length} open port(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
      const refreshed = await fetchDevices().catch(() => null);
      if (refreshed) setDevices(refreshed);
    } finally {
      setScanningId(null);
    }
  };

  const removeDevice = async (id: string) => {
    try {
      await deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setSelected(null);
      toast.success("Device removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Device Management"
          description={DESCRIPTION}
        />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Device Management"
          description={DESCRIPTION}
        />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Device Management"
        description={DESCRIPTION}
        actions={
          <Button variant="gradient" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        }
      />

      {devices.length === 0 && (
        <EmptyState
          icon={MonitorSmartphone}
          title="No devices yet"
          description="Add the computers, servers and other devices you manage. Each scan checks whether the device is reachable and which common ports are open."
          action={
            <Button variant="cyan" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add your first device
            </Button>
          }
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => {
          const Icon = typeIcon[device.type];
          const isScanning =
            scanningId === device.id || device.status === "scanning";
          return (
            <Card key={device.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {device.os}
                      </p>
                    </div>
                  </div>
                  <RiskBadge level={device.riskLevel} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="capitalize">
                      {device.lastScan ? device.status.replace("_", " ") : "not scanned"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-mono text-xs">{device.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last scan</span>
                    <span>{device.lastScan ? formatRelativeTime(device.lastScan) : "Never"}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button
                    size="sm"
                    variant="cyan"
                    className="flex-1"
                    onClick={() => runScan(device.id)}
                    disabled={isScanning}
                  >
                    <ScanSearch className="h-4 w-4" />
                    {isScanning ? "Scanning..." : "Run Scan"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(device)}
                    aria-label="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(device)}
                    aria-label="Edit device"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeDevice(device.id)}
                    aria-label="Remove device"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Device details and posture</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <Row label="Operating System" value={selected.os} />
                <Row label="Type" value={selected.type} />
                <Row label="IP / Hostname" value={selected.ipAddress} />
                <Row
                  label="Status"
                  value={selected.lastScan ? selected.status.replace("_", " ") : "not scanned"}
                />
                <Row label="Risk Level" value={selected.riskLevel} />
                <Row
                  label="Last Scan"
                  value={selected.lastScan ? formatDate(selected.lastScan) : "Never"}
                />
                {selected.lastScanResult && (
                  <div className="pt-2">
                    <p className="mb-2 text-muted-foreground">Last scan result</p>
                    {selected.lastScanResult.error ? (
                      <p className="text-red-400">{selected.lastScanResult.error}</p>
                    ) : selected.lastScanResult.openPorts.length === 0 ? (
                      <p className="text-muted-foreground">
                        No response on ports{" "}
                        {selected.lastScanResult.checkedPorts.join(", ")}.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selected.lastScanResult.openPorts.map((p) => (
                          <Badge key={p.port} variant={p.risky ? "high" : "outline"}>
                            {p.port}/{p.service}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className="pt-2 text-xs text-muted-foreground">
                  Scans are TCP connection checks run from the CyberGuard server, so
                  private network addresses are only reachable when CyberGuard is
                  self-hosted on that network.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button variant="cyan" onClick={() => runScan(selected.id)}>
                  Run Scan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit device" : "Add device"}</DialogTitle>
            <DialogDescription>
              Enter a public IP address or hostname so the device can be scanned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Name</Label>
              <Input
                id="device-name"
                value={form.name}
                placeholder="Office laptop"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-ip">IP address or hostname</Label>
              <Input
                id="device-ip"
                value={form.ipAddress}
                placeholder="203.0.113.10 or server.example.com"
                onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="device-os">Operating system</Label>
                <Input
                  id="device-os"
                  value={form.os}
                  placeholder="Windows 11"
                  onChange={(e) => setForm({ ...form, os: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Device["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["desktop", "laptop", "mobile", "server", "iot"] as const).map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t === "iot" ? "IoT" : t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" onClick={saveDevice} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 capitalize">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
