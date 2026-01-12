import { auth } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, successResponse, serverError, serializeMonitor } from "@/lib/api-helpers";
import { MonitorFormData } from "@/types";

export async function GET() {
  const session = await requireAuth();
  if (!session) return serverError();

  try {
    const monitors = await prisma.monitor.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(monitors.map(serializeMonitor));
  } catch (error) {
    return serverError();
  }
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return serverError();

  try {
    const body: MonitorFormData = await req.json();

    const monitor = await prisma.monitor.create({
      data: {
        userId: session.user.id,
        name: body.name,
        type: body.type || "http",
        target: body.target,
        method: body.method || "GET",
        intervalSeconds: parseInt(String(body.intervalSeconds)) || 60,
        timeoutMs: parseInt(String(body.timeoutMs)) || 5000,
        expectedStatus: body.expectedStatus ? parseInt(String(body.expectedStatus)) : 200,
        nextRunAt: new Date(),
        enabled: true,
      },
    });

    return successResponse(serializeMonitor(monitor), 201);
  } catch (error) {
    return serverError();
  }
}
