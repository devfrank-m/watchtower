"use client";

import { Card } from "@/components/ui/card";
import { Globe, Clock, Edit2, Trash2, XCircle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Monitor } from "@/types";

interface MonitorCardProps {
  monitor: Monitor;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function MonitorCard({ monitor, onEdit, onDelete, onToggle }: MonitorCardProps) {
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
    </Card>
  );
}
