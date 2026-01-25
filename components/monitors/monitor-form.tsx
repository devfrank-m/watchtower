"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, MonitorFormData } from "@/types";

interface MonitorFormProps {
  onClose: () => void;
  onSave: (monitor: Partial<MonitorFormData>) => void;
  monitor?: Monitor;
}

export function MonitorForm({ onClose, onSave, monitor }: MonitorFormProps) {
  const [formData, setFormData] = useState<MonitorFormData>({
    name: monitor?.name || "",
    type: monitor?.type || "http",
    target: monitor?.target || "",
    method: monitor?.method || "GET",
    intervalSeconds: monitor?.intervalSeconds || 60,
    timeoutMs: monitor?.timeoutMs || 5000,
    expectedStatus: monitor?.expectedStatus || 200,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200 border-2">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {monitor ? "Edit Monitor" : "Create New Monitor"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your service monitor settings
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Monitor Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Production API"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP / HTTPS</SelectItem>
                  <SelectItem value="tcp" disabled>
                    TCP (Coming Soon)
                  </SelectItem>
                  <SelectItem value="ping" disabled>
                    Ping (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-sm font-semibold">
              Target URL
            </Label>
            <Input
              id="target"
              value={formData.target}
              onChange={(e) =>
                setFormData({ ...formData, target: e.target.value })
              }
              placeholder="https://api.example.com/health"
              type="url"
              required
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="method" className="text-sm font-semibold">
                HTTP Method
              </Label>
              <Select
                value={formData.method}
                onValueChange={(value) =>
                  setFormData({ ...formData, method: value })
                }
              >
                <SelectTrigger id="method" className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedStatus" className="text-sm font-semibold">
                Expected Status
              </Label>
              <Input
                id="expectedStatus"
                type="number"
                value={formData.expectedStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedStatus: parseInt(e.target.value),
                  })
                }
                min="100"
                max="599"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-sm font-semibold">
                Interval (seconds)
              </Label>
              <Input
                id="interval"
                type="number"
                value={formData.intervalSeconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intervalSeconds: parseInt(e.target.value),
                  })
                }
                min="10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-sm font-semibold">
                Timeout (ms)
              </Label>
              <Input
                id="timeout"
                type="number"
                value={formData.timeoutMs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeoutMs: parseInt(e.target.value),
                  })
                }
                min="1000"
                max="30000"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              {monitor ? "Save Changes" : "Create Monitor"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
