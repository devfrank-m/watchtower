"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Activity,
    Bell,
    LogOut,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

interface SidebarProps {
    userEmail: string;
    onSignOut: () => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ userEmail, onSignOut, collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Monitors",
            href: "/dashboard/monitors",
            icon: Activity,
        },
        {
            title: "Alerts",
            href: "/dashboard/alerts",
            icon: Bell,
        },
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-4 h-16">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold tracking-tight">
                                Watchtower
                            </span>
                        </div>
                    )}
                    {collapsed && (
                        <Activity className="h-6 w-6 text-primary mx-auto" />
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? item.title : undefined}
                            >
                                <Icon className={cn("h-4 w-4", collapsed ? "" : "shrink-0")} />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Controls */}
                <div className="p-2 border-t flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn(
                            "flex-1 justify-start gap-3 px-3",
                            collapsed && "px-0 justify-center"
                        )}
                    >
                        <Menu className="h-4 w-4" />
                        {!collapsed && <span>Collapse</span>}
                    </Button>
                    <ModeToggle />
                </div>

                {/* User Section */}
                <div className="border-t p-2 space-y-2">
                    {!collapsed && (
                        <div className="px-3 py-2 rounded-md bg-muted/50">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                Email
                            </p>
                            <p className="truncate text-xs font-medium text-foreground">
                                {userEmail}
                            </p>
                        </div>
                    )}
                    <Button
                        onClick={onSignOut}
                        variant="secondary"
                        size={collapsed ? "icon" : "sm"}
                        className={cn(
                            "w-full",
                            !collapsed && "justify-start gap-3 px-3"
                        )}
                        title={collapsed ? "Sign Out" : undefined}
                    >
                        <LogOut className="h-4 w-4" />
                        {!collapsed && <span>Sign Out</span>}
                    </Button>
                </div>
            </div>
        </aside>
    );
}
