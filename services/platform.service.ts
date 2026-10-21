import { apiClient } from "@/lib/api-client";
import type {
  Alert,
  AlertStatus,
  ChartDataPoint,
  Device,
  SecurityMetric,
  SecurityReport,
  ThreatTimelineEvent,
} from "@/types";

export type DashboardOverview = {
  securityScore: number;
  metrics: SecurityMetric[];
  recentAlerts: Alert[];
  timeline: ThreatTimelineEvent[];
  activity: ChartDataPoint[];
  riskDistribution: ChartDataPoint[];
  counts?: { alerts: number; devices: number };
};

function viewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export async function fetchDashboard(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardOverview>("/dashboard", {
    params: { tz: viewerTimeZone() },
  });
  return data;
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data } = await apiClient.get<Alert[]>("/alerts");
  return data;
}

export async function updateAlert(
  id: string,
  status: AlertStatus
): Promise<Alert> {
  const { data } = await apiClient.patch<Alert>(`/alerts/${id}`, { status });
  return data;
}

export async function fetchDevices(): Promise<Device[]> {
  const { data } = await apiClient.get<Device[]>("/devices");
  return data;
}

export async function scanDevice(id: string): Promise<Device> {
  const { data } = await apiClient.post<Device>(`/devices/${id}?action=scan`);
  return data;
}

export type DeviceInput = Pick<Device, "name" | "os" | "type" | "ipAddress">;

export async function createDevice(input: DeviceInput): Promise<Device> {
  const { data } = await apiClient.post<Device>("/devices", input);
  return data;
}

export async function updateDevice(
  id: string,
  input: Partial<DeviceInput>
): Promise<Device> {
  const { data } = await apiClient.patch<Device>(`/devices/${id}`, input);
  return data;
}

export async function deleteDevice(id: string): Promise<void> {
  await apiClient.delete(`/devices/${id}`);
}

export async function fetchReport(): Promise<{
  report: SecurityReport;
  activity: ChartDataPoint[];
  riskDistribution: ChartDataPoint[];
}> {
  const { data } = await apiClient.get<{
    report: SecurityReport;
    activity: ChartDataPoint[];
    riskDistribution: ChartDataPoint[];
  }>("/reports", { params: { tz: viewerTimeZone() } });
  return data;
}
