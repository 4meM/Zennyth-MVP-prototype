import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  color?: string;
}

export function Progress({
  value,
  className,
  color = "bg-primary",
}: ProgressProps) {
  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-bg-subtle overflow-hidden",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
