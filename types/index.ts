export interface Monitor {
  id: string;
  name: string;
  type: string;
  target: string;
  method?: string;
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatus?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  nextRunAt: string;
}

export interface MonitorFormData {
  name: string;
  type: string;
  target: string;
  method?: string;
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatus?: number;
}

export interface MonitorRun {
  id: string;
  monitorId: string;
  runAt: string;
  status: number;
  latencyMs: number | null;
  error: string | null;
}

export interface MonitorDailyStats {
  day: string;
  totalChecks: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number | null;
}

export interface MonitorStats {
  dailyStats: MonitorDailyStats[];
  percentiles: {
    p50: number | null;
    p95: number | null;
    p99: number | null;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface ApiError {
  message: string;
}

export type ApiSuccess<T> = {
  data: T;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
