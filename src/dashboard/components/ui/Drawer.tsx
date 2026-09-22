import React, { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Heading, Text } from "./Typography";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  position?: "left" | "right" | "center";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  footer,
  position = "right",
  size = "md",
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: position === "center" ? "max-w-3xl" : "max-w-lg",
    xl: position === "center" ? "max-w-5xl" : "max-w-xl",
    full: "max-w-full sm:max-w-[92%]",
  };

  const initialX = position === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs transition-all"
          />

          {position === "center" ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn(
                  "w-full max-h-[90vh] bg-card text-card-foreground border border-border shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden",
                  sizeClasses[size],
                  className
                )}
              >
                <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
                  <div>
                    {title && (
                      <Heading level="h4" className="text-foreground font-semibold">
                        {title}
                      </Heading>
                    )}
                    {description && (
                      <Text variant="muted" className="mt-1 text-xs">
                        {description}
                      </Text>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {children}
                </div>
                {footer && (
                  <div className="border-t border-border px-6 py-4 bg-muted/20 shrink-0">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div
              className={cn(
                "fixed inset-y-0 z-50 flex pointer-events-none",
                position === "right" ? "right-0" : "left-0"
              )}
            >
              <motion.div
                initial={{ x: initialX }}
                animate={{ x: 0 }}
                exit={{ x: initialX }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className={cn(
                  "h-full w-screen bg-card text-card-foreground border-l border-border shadow-2xl pointer-events-auto flex flex-col",
                  sizeClasses[size],
                  className
                )}
              >
                <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
                  <div>
                    {title && (
                      <Heading level="h4" className="text-foreground font-semibold">
                        {title}
                      </Heading>
                    )}
                    {description && (
                      <Text variant="muted" className="mt-1 text-xs">
                        {description}
                      </Text>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={onClose}
                    aria-label="Close drawer"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {children}
                </div>
                {footer && (
                  <div className="border-t border-border p-6 bg-muted/20 shrink-0">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
