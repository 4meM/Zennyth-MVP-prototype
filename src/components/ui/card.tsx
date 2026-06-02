import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card-surface p-5",
          "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hover && "hover:border-border-strong hover:bg-surface-hover",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
