import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "warning" | "danger" | "premium";

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-subtle text-text-2",
  accent: "bg-accent-subtle text-accent",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  premium: "bg-primary-subtle text-primary",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
