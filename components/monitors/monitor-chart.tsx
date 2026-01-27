"use client";

import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { MonitorRun } from "@/types";

interface MonitorChartProps {
  runs: MonitorRun[];
}

const chartConfig = {
  latencyMs: {
    label: "Latency",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MonitorChart({ runs }: MonitorChartProps) {
  const chartData = useMemo(() => {
    return [...runs]
      .reverse()
      .map((run) => ({
        time: new Date(run.runAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latencyMs: run.latencyMs ?? 0,
        status: run.status,
        isSuccess: run.status >= 200 && run.status < 300,
      }));
  }, [runs]);

  if (runs.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
      <StatusBar runs={runs} />
    </div>
  );
}

function StatusBar({ runs }: { runs: MonitorRun[] }) {
  const reversed = useMemo(() => [...runs].reverse(), [runs]);
  const maxDots = 50;
  const displayRuns = reversed.slice(-maxDots);

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-2">
        Status
      </span>
      <div className="flex gap-0.5">
        {displayRuns.map((run, i) => {
          const isSuccess = run.status >= 200 && run.status < 300;
          return (
            <div
              key={run.id}
              className={`w-1.5 h-3 rounded-sm ${isSuccess ? "bg-emerald-500" : "bg-destructive"}`}
              title={`${new Date(run.runAt).toLocaleString()} - ${run.status}${run.error ? `: ${run.error}` : ""}`}
            />
          );
        })}
      </div>
      {displayRuns.length > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          {Math.round((displayRuns.filter(r => r.status >= 200 && r.status < 300).length / displayRuns.length) * 100)}%
        </span>
      )}
    </div>
  );
}
