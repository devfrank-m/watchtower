"use client";

import { Sidebar } from "./sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
    userEmail: string;
}

export function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const handleSignOut = async () => {
        await fetch("/api/auth/signout", {
            method: "POST",
        });
        router.push("/signin");
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar
                userEmail={userEmail}
                onSignOut={handleSignOut}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />
            <div className={cn(
                "transition-all duration-300 ease-in-out",
                collapsed ? "pl-16" : "pl-64"
            )}>
                <main className="min-h-screen p-6">{children}</main>
            </div>
        </div>
    );
}
