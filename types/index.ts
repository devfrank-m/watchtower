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
