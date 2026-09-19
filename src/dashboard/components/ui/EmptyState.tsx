import React from "react";
import { cn } from "../../utils/cn";
import { LucideIcon } from "lucide-react";
import { Heading, Text } from "./Typography";
import { Button } from "./Button";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted/30 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6">
        {Icon ? (
          <Icon className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        )}
      </div>
      <Heading level="h3" className="mb-2">
        {title}
      </Heading>
      <Text variant="muted" className="mb-6 max-w-md">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
