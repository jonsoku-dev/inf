import { Badge } from "~/common/components/ui/badge";
import { APPLICATION_STATUS_LABELS } from "../constants";

interface ApplicationStatusBadgeProps {
    status: keyof typeof APPLICATION_STATUS_LABELS;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
    return (
        <Badge variant={status === "APPROVED" ? "success" : status === "REJECTED" ? "destructive" : "secondary"}>
            {APPLICATION_STATUS_LABELS[status]}
        </Badge>
    );
} 