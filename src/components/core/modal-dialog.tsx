"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

interface ModalProps {
  trigger?: React.ReactNode; // Optional trigger element (e.g., button)
  title?: string; // Optional modal title
  children: React.ReactNode; // Content to display in the modal
  isOpen?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Callback for open state changes
  className?: string; // Additional classes for the modal content
}

export function Modal({
  trigger,
  title,
  children,
  isOpen,
  onOpenChange,
  className,
}: ModalProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "sm:max-w-[425px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-lg",
          className
        )}
        onKeyDown={handleKeyDown}
      >
        {(title || onOpenChange) && (
          <DialogHeader className="flex flex-row items-center justify-between">
            {title && (
              <DialogTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {title}
              </DialogTitle>
            )}
            {/* {onOpenChange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </Button>
            )} */}
          </DialogHeader>
        )}
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
