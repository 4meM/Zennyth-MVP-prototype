"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, isValidElement, cloneElement } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-on-primary shadow-sm shadow-primary/20",
  secondary:
    "bg-surface hover:bg-surface-hover text-text-2 border border-border",
  ghost:
    "hover:bg-bg-subtle text-text-2 hover:text-text-1",
  danger:
    "bg-danger-subtle hover:bg-danger/15 text-danger border border-danger/15",
  accent:
    "bg-accent-subtle hover:bg-accent/15 text-accent border border-accent/15",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-sm gap-2 rounded-xl",
  icon: "w-9 h-9 rounded-xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, asChild, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center font-semibold cursor-pointer",
      "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
      "active:scale-[0.97]",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild && isValidElement(children)) {
      const childProps = children.props as { className?: string };
      return cloneElement(children, {
        className: cn(classes, childProps.className),
        ref,
        ...props,
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
