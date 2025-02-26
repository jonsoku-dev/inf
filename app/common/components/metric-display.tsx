import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface MetricDisplayProps {
  icon: LucideIcon;
  value: number | string;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  label?: string;
  onClick?: () => void;
}

export function MetricDisplay({
  icon: Icon,
  value,
  className,
  iconClassName,
  valueClassName,
  label,
  onClick,
}: MetricDisplayProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-px text-xs",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      <Icon className={cn("h-4 w-4", iconClassName)} />
      <span className={valueClassName}>{value}</span>
      {label && <span className="ml-1">{label}</span>}
    </div>
  );
}
