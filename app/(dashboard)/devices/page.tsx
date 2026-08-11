"use client";

import { useState } from "react";
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
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockDevices } from "@/lib/mock-data/dashboard";
import type { Device } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const typeIcon = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  server: Server,
  iot: Cpu,
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selected, setSelected] = useState<Device | null>(null);

  const runScan = (id: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "scanning",
              lastScan: new Date().toISOString(),
            }
          : d
      )
    );
    toast.success("Device scan started");
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: d.riskLevel === "critical" ? "at_risk" : "online",
                lastScan: new Date().toISOString(),
              }
            : d
        )
      );
      toast.success("Scan completed");
    }, 2000);
  };

  const removeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setSelected(null);
    toast.success("Device removed");
  };

  return (
    <div>
      <PageHeader
        title="Device Management"
        description="Monitor connected devices, risk levels, and scan status"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => {
          const Icon = typeIcon[device.type];
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
                      {device.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP</span>
                    <span className="font-mono text-xs">{device.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last scan</span>
                    <span>{formatRelativeTime(device.lastScan)}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button
                    size="sm"
                    variant="cyan"
                    className="flex-1"
                    onClick={() => runScan(device.id)}
                    disabled={device.status === "scanning"}
                  >
                    <ScanSearch className="h-4 w-4" />
                    {device.status === "scanning" ? "Scanning..." : "Run Scan"}
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
                <Row label="IP Address" value={selected.ipAddress} />
                <Row label="Status" value={selected.status.replace("_", " ")} />
                <Row label="Risk Level" value={selected.riskLevel} />
                <Row label="Last Scan" value={formatDate(selected.lastScan)} />
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
