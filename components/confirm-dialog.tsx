"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "default";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 border-2">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "p-2 rounded-full mb-4",
                        variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full -mt-2 -mr-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
