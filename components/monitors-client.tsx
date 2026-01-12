"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Activity, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MonitorCard } from "@/components/monitors/monitor-card";
import { MonitorForm } from "@/components/monitors/monitor-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Monitor, MonitorFormData } from "@/types";
import { useFetch, useApiCall, useOptimisticUpdate } from "@/lib/hooks";

export function MonitorsClient() {
  const [showForm, setShowForm] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: monitors = [], loading, error, refetch } = useFetch<Monitor[]>("/api/monitors");
  const { data, updateItem, removeItem } = useOptimisticUpdate<Monitor>(monitors ?? []);
  const { execute: saveMonitor } = useApiCall<any>();

  const handleSave = async (monitorData: Partial<Monitor>) => {
    try {
      const url = editingMonitor ? `/api/monitors/${editingMonitor.id}` : "/api/monitors";
      await saveMonitor(url, {
        method: editingMonitor ? "PATCH" : "POST",
        body: monitorData,
      });
      await refetch();
      setShowForm(false);
      setEditingMonitor(undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save monitor");
    }
  };

  const handleEdit = (monitor: Monitor) => {
    setEditingMonitor(monitor);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await saveMonitor(`/api/monitors/${deleteId}`, { method: "DELETE" });
      removeItem(deleteId);
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete monitor");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (id: string) => {
    const monitor = data.find(m => m.id === id);
    if (!monitor) return;

    const previousState = monitor.enabled;
    updateItem(id, { enabled: !previousState });

    try {
      await saveMonitor(`/api/monitors/${id}`, {
        method: "PATCH",
        body: { enabled: !previousState },
      });
      await refetch();
    } catch (err) {
      updateItem(id, { enabled: previousState });
      alert(err instanceof Error ? err.message : "Failed to toggle monitor");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Monitors"
        description="Manage and track the availability and performance of your services."
      >
        <Button
          onClick={() => {
            setEditingMonitor(undefined);
            setShowForm(true);
          }}
          className="shadow-sm"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Monitor
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            Loading monitors...
          </p>
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-destructive/20 bg-destructive/5">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-10 w-10 text-destructive/50" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Failed to load monitors</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {error}. Please try refreshing the page or contact support if the problem persists.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : data.length === 0 ? (
        <Card className="p-16 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Activity className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-lg font-semibold mb-2">No monitors yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first monitor to start tracking your services and receive alerts.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Monitor
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onEdit={() => handleEdit(monitor)}
              onDelete={() => setDeleteId(monitor.id)}
              onToggle={() => handleToggle(monitor.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <MonitorForm
          onClose={() => {
            setShowForm(false);
            setEditingMonitor(undefined);
          }}
          onSave={handleSave}
          monitor={editingMonitor}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Monitor"
        description="Are you sure you want to delete this monitor? This action cannot be undone and all historical data for this monitor will be lost."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
