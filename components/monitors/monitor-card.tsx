"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Globe, Clock, Edit2, Trash2, XCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Monitor, MonitorRun } from "@/types";
import { MonitorChart } from "./monitor-chart";
import { RefreshHeader } from "@/components/refresh-header";

interface MonitorCardProps {
  monitor: Monitor;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function MonitorCard({ monitor, onEdit, onDelete, onToggle }: MonitorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [runs, setRuns] = useState<MonitorRun[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/monitors/${monitor.id}/runs?limit=100`);
      if (res.ok) {
        setRuns(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [monitor.id]);

  useEffect(() => {
    if (expanded && !runs) {
      fetchRuns();
    }
  }, [expanded, runs, fetchRuns]);

  return (
    <Card className="p-6 transition-all hover:border-primary/50 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{monitor.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {monitor.target}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Method
              </p>
              <p className="text-sm font-medium">{monitor.method || "GET"}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Interval
              </p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {monitor.intervalSeconds}s
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Timeout
              </p>
              <p className="text-sm font-medium">{monitor.timeoutMs}ms</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Status
              </p>
              <StatusBadge
                status={monitor.enabled ? "success" : "neutral"}
                label={monitor.enabled ? "Active" : "Paused"}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-1 ml-4 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-9 w-9"
            title={expanded ? "Hide graph" : "Show graph"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-9 w-9"
            title={monitor.enabled ? "Pause monitor" : "Resume monitor"}
          >
            {monitor.enabled ? (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-9 w-9 hover:text-primary hover:bg-primary/10"
            title="Edit monitor"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-9 w-9 hover:text-destructive hover:bg-destructive/10"
            title="Delete monitor"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="mt-6 pt-6 border-t">
          <RefreshHeader title="Recent Activity" loading={loading} onRefresh={fetchRuns} />
          {loading && !runs ? (
            <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            <div className={loading ? "opacity-50 pointer-events-none" : ""}>
              <MonitorChart runs={runs || []} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
