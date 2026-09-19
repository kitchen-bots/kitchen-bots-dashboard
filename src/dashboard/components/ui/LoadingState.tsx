import React from "react";
import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";
import { Text } from "./Typography";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export function LoadingState({
  text = "Loading...",
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted/30 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <Spinner size="xl" className="mb-4 text-brand-primary" />
      <Text variant="muted">{text}</Text>
    </div>
  );
}
