import { prisma } from "@/lib/prisma";
import { requireAuth, notFound, successResponse, serverError, unauthorized } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;

  if (!session) return unauthorized();

  try {
    const monitor = await prisma.monitor.findUnique({
      where: { id: BigInt(id), userId: session.user.id },
    });

    if (!monitor) return notFound();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

    const runs = await prisma.monitorRun.findMany({
      where: { monitorId: BigInt(id) },
      orderBy: { runAt: "desc" },
      take: limit,
    });

    const serialized = runs.map((run) => ({
      id: run.id.toString(),
      monitorId: run.monitorId.toString(),
      runAt: run.runAt.toISOString(),
      status: run.status,
      latencyMs: run.latencyMs,
      error: run.error,
    }));

    return successResponse(serialized);
  } catch (error) {
    console.error("Error fetching monitor runs:", error);
    return serverError();
  }
}
