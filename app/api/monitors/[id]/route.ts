import { prisma } from "@/lib/prisma";
import { requireAuth, notFound, successResponse, serverError, serializeMonitor } from "@/lib/api-helpers";
import { MonitorFormData } from "@/types";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;

  if (!session) return serverError();

  try {
    const body: MonitorFormData = await req.json();

    const existingMonitor = await prisma.monitor.findUnique({
      where: { id: BigInt(id), userId: session.user.id },
    });

    if (!existingMonitor) return notFound();

    const updatedMonitor = await prisma.monitor.update({
      where: { id: BigInt(id) },
      data: {
        name: body.name,
        type: body.type,
        target: body.target,
        method: body.method,
        intervalSeconds: body.intervalSeconds ? parseInt(String(body.intervalSeconds)) : undefined,
        timeoutMs: body.timeoutMs ? parseInt(String(body.timeoutMs)) : undefined,
        expectedStatus: body.expectedStatus ? parseInt(String(body.expectedStatus)) : undefined,
      },
    });

    return successResponse(serializeMonitor(updatedMonitor));
  } catch (error) {
    return serverError();
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;

  if (!session) return serverError();

  try {
    const existingMonitor = await prisma.monitor.findUnique({
      where: { id: BigInt(id), userId: session.user.id },
    });

    if (!existingMonitor) return notFound();

    await prisma.monitor.delete({ where: { id: BigInt(id) } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError();
  }
}
