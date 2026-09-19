import React from "react";
import { cn } from "../../utils/cn";
import { AlertTriangle } from "lucide-react";
import { Heading, Text } from "./Typography";
import { Button } from "./Button";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this content. Please try again.",
  actionLabel = "Try Again",
  onAction,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted/30 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-500" strokeWidth={1.5} />
      </div>
      <Heading level="h3" className="mb-2 text-foreground">
        {title}
      </Heading>
      <Text variant="muted" className="mb-6 max-w-md">
        {description}
      </Text>
      {onAction && (
        <Button onClick={onAction} size="lg" variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
