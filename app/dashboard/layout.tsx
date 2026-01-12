import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { ClientSideLayout } from "@/components/client-side-layout";

export default async function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <ClientSideLayout userEmail={session.user.email || ""}>
                {children}
            </ClientSideLayout>
        </div>
    );
}
