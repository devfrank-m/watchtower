import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { MonitorsClient } from "@/components/monitors-client";

export default async function MonitorsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    return (
        <div className="p-8">
            <MonitorsClient />
        </div>
    );
}
