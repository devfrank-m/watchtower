"use client";

import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { MonitorRun, MonitorStats } from "@/types";

interface MonitorChartProps {
  runs: MonitorRun[];
  stats?: MonitorStats | null;
}

const chartConfig = {
  latencyMs: {
    label: "Latency",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MonitorChart({ runs, stats }: MonitorChartProps) {
  const chartData = useMemo(() => {
    return [...runs]
      .reverse()
      .map((run) => ({
        time: new Date(run.runAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latencyMs: run.latencyMs ?? 0,
        status: run.status,
      }));
  }, [runs]);

  if (runs.length === 0 && !stats) {
    return (
      <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {runs.length > 0 && (
        <ChartContainer config={chartConfig} className="h-[120px] w-full">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}ms`}
              width={45}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`${value}ms`, "Latency"]}
                  labelFormatter={(label) => label}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="latencyMs"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill="url(#latencyGradient)"
            />
          </AreaChart>
        </ChartContainer>
      )}

      {stats?.percentiles && <PercentilesGrid percentiles={stats.percentiles} />}
    </div>
  );
}

function PercentilesGrid({ percentiles }: { percentiles: MonitorStats["percentiles"] }) {
  const items = [
    { label: "P50", value: percentiles.p50 },
    { label: "P95", value: percentiles.p95 },
    { label: "P99", value: percentiles.p99 },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ label, value }) => (
        <div key={label} className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            {label}
          </p>
          <p className="text-sm font-medium">
            {value != null ? `${value}ms` : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
