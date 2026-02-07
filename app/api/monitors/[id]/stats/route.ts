import { prisma } from "@/lib/prisma";
import { requireAuth, notFound, successResponse, serverError, unauthorized } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
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

    const monitorId = BigInt(id);

    const [dailyRows, percentileRows] = await Promise.all([
      prisma.$queryRawUnsafe<
        {
          day: Date;
          total_checks: bigint;
          success_count: bigint;
          failure_count: bigint;
          avg_latency_ms: number | null;
        }[]
      >(
        `SELECT day, total_checks, success_count, failure_count, avg_latency_ms
         FROM monitor_daily_stats
         WHERE "monitorId" = $1
         ORDER BY day DESC
         LIMIT 90`,
        monitorId
      ),
      prisma.$queryRawUnsafe<
        {
          p50: number | null;
          p95: number | null;
          p99: number | null;
        }[]
      >(
        `SELECT
           percentile_cont(0.5) WITHIN GROUP (ORDER BY "latencyMs") AS p50,
           percentile_cont(0.95) WITHIN GROUP (ORDER BY "latencyMs") AS p95,
           percentile_cont(0.99) WITHIN GROUP (ORDER BY "latencyMs") AS p99
         FROM monitor_runs
         WHERE "monitorId" = $1 AND "runAt" > NOW() - INTERVAL '24 hours'`,
        monitorId
      ),
    ]);

    const dailyStats = (dailyRows as any[]).map((row) => ({
      day: new Date(row.day).toISOString(),
      totalChecks: Number(row.total_checks),
      successCount: Number(row.success_count),
      failureCount: Number(row.failure_count),
      avgLatencyMs: row.avg_latency_ms != null ? Math.round(Number(row.avg_latency_ms)) : null,
    }));

    const pRow = (percentileRows as any[])[0];
    const percentiles = {
      p50: pRow?.p50 != null ? Math.round(Number(pRow.p50)) : null,
      p95: pRow?.p95 != null ? Math.round(Number(pRow.p95)) : null,
      p99: pRow?.p99 != null ? Math.round(Number(pRow.p99)) : null,
    };

    return successResponse({ dailyStats, percentiles });
  } catch (error) {
    console.error("Error fetching monitor stats:", error);
    return serverError();
  }
}
