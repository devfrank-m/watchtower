import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, StatusType } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default async function AlertsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    const alerts: any[] = [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Alerts"
                description="View and manage system notifications and service incidents."
            />

            {alerts.length === 0 ? (
                <Card className="p-16 text-center border-2 border-dashed">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-muted">
                            <Bell className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">No alerts</h3>
                            <p className="text-muted-foreground">
                                All systems are operating normally
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {alerts.map((alert) => (
                        <Card
                            key={alert.id}
                            className="p-5 flex items-start gap-4 transition-all hover:border-primary/50"
                        >
                            <div className="mt-1">
                                <StatusBadge
                                    status={alert.type}
                                    label={alert.type.toUpperCase()}
                                    className="px-2 py-1"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-foreground leading-none mb-2">
                                            {alert.message}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-medium">Monitor:</span>
                                            <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                                {alert.monitor}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
