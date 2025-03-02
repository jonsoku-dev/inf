import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { BellIcon } from "lucide-react";

interface AlertIndicatorProps {
    unreadCount: number;
}

export function AlertIndicator({ unreadCount }: AlertIndicatorProps) {
    return (
        <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/my/alerts">
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Link>
        </Button>
    );
} 