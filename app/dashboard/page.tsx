import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Activity, Bell, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const stats = [
    {
      title: "Active Monitors",
      value: "0",
      change: "No monitors configured",
      icon: Activity,
    },
    {
      title: "Uptime",
      value: "100%",
      change: "System standby",
      icon: CheckCircle2,
    },
    {
      title: "Active Alerts",
      value: "0",
      change: "All systems healthy",
      icon: Bell,
    },
    {
      title: "Avg Response Time",
      value: "0ms",
      change: "No data available",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome back, ${session.user.name}!`}
        description="Here's what's happening with your infrastructure today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-6 transition-all hover:border-primary/50 group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-md bg-muted text-muted-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-8 border-dashed border-2 flex flex-col items-center text-center justify-center min-h-[250px]">
          <div className="p-3 rounded-full bg-muted mb-4">
            <Activity className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight mb-1">No Recent Activity</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
            Once you create monitors, their latest status and checks will appear here.
          </p>
          <Link
            href="/dashboard/monitors"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Go to Monitors <TrendingUp className="ml-1 h-3 w-3" />
          </Link>
        </Card>

        <Card className="p-8 border-dashed border-2 flex flex-col items-center text-center justify-center min-h-[250px]">
          <div className="p-3 rounded-full bg-muted mb-4">
            <Bell className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight mb-1">Zero Active Alerts</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
            System notifications and incident history will be displayed here as they occur.
          </p>
          <Link
            href="/dashboard/alerts"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Go to Alerts <TrendingUp className="ml-1 h-3 w-3" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
