"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
    status: StatusType;
    label: string;
    icon?: boolean;
    className?: string;
}

const statusStyles: Record<StatusType, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
    neutral: "bg-muted text-muted-foreground border-border",
};

const statusIcons: Record<StatusType, any> = {
    success: CheckCircle2,
    warning: Clock,
    error: XCircle,
    info: AlertCircle,
    neutral: Clock,
};

export function StatusBadge({ status, label, icon = true, className }: StatusBadgeProps) {
    const Icon = statusIcons[status];

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
            statusStyles[status],
            className
        )}>
            {icon && Icon && <Icon className="h-3 w-3" />}
            {label}
        </span>
    );
}
