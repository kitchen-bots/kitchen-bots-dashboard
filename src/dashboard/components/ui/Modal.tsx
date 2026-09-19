import React, { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Heading, Text } from "./Typography";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  footer,
}: ModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-overlay bg-background/80 backdrop-blur-sm transition-all"
            role="presentation"
          />
          <div className="fixed inset-0 z-modal flex items-center justify-center pointer-events-none p-4 sm:p-0">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className={cn(
                "w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground shadow-elevation-lg pointer-events-auto",
                className
              )}
            >
              {(title || description) && (
                <div className="flex flex-col space-y-1.5 p-6 border-b">
                  <div className="flex items-center justify-between">
                    {title && <Heading level="h4">{title}</Heading>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={onClose}
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {description && (
                    <Text variant="muted">{description}</Text>
                  )}
                </div>
              )}
              {!title && !description && (
                <div className="absolute right-4 top-4 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/50 hover:bg-accent"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="p-6">{children}</div>
              {footer && (
                <div className="flex items-center justify-end space-x-2 border-t bg-muted/50 p-6">
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
