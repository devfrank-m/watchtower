import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshHeaderProps {
    title: string;
    loading: boolean;
    onRefresh: () => void;
    className?: string;
}

export function RefreshHeader({ title, loading, onRefresh, className = "" }: RefreshHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
            <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="h-8"
                title="Refresh data"
            >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
            </Button>
        </div>
    );
}
