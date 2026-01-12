import { NextResponse } from "next/server";
import { auth } from "@/config/auth";

type MonitorWithDates = {
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
  nextRunAt: Date;
  [key: string]: any;
};

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export function requireAdmin(session: any) {
  if ((session?.user as any)?.role !== "admin") {
    return false;
  }
  return true;
}

export function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export function notFound() {
  return NextResponse.json({ message: "Not Found" }, { status: 404 });
}

export function serverError(message: string = "Internal Server Error") {
  return NextResponse.json({ message }, { status: 500 });
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function serializeMonitor(monitor: MonitorWithDates) {
  return {
    ...monitor,
    id: monitor.id.toString(),
    createdAt: monitor.createdAt.toISOString(),
    updatedAt: monitor.updatedAt.toISOString(),
    nextRunAt: monitor.nextRunAt.toISOString(),
  };
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  return serverError();
}

export function validateRequired(data: Record<string, any>, fields: string[]) {
  const missing = fields.filter((field) => !data[field]);
  return missing.length === 0 ? null : missing;
}
