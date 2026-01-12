"use client";

import { Sidebar } from "./sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ClientSideLayoutProps {
    children: React.ReactNode;
    userEmail: string;
}

export function ClientSideLayout({ children, userEmail }: ClientSideLayoutProps) {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleSignOut = async () => {
        try {
            const response = await fetch("/api/auth/signout", {
                method: "POST",
            });

            if (response.ok) {
                router.push("/signin");
            }
        } catch (error) {
            console.error("Sign out error:", error);
            window.location.href = "/signin";
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar
                userEmail={userEmail}
                onSignOut={handleSignOut}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "pl-16" : "pl-64"
                )}
            >
                <main className="min-h-screen p-6">{children}</main>
            </div>
        </div>
    );
}
