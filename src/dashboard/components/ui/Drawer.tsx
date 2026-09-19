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
  position?: "left" | "right";
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
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full sm:max-w-[90%]",
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
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-all"
          />
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
                "h-full w-screen bg-surface shadow-elevation-floating pointer-events-auto flex flex-col",
                sizeClasses[size],
                className
              )}
            >
              <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
                <div>
                  {title && <Heading level="h4">{title}</Heading>}
                  {description && (
                    <Text variant="muted" className="mt-1">
                      {description}
                    </Text>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full shrink-0"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
              {footer && (
                <div className="border-t border-border-default p-6 bg-slate-50/50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
