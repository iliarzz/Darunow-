"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  extra?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  options,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ConfirmOptions | null;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title}</AlertDialogTitle>
          {options?.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {options?.extra}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>{options?.cancelText ?? "انصراف"}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={options?.variant === "destructive" ? "destructive" : "primary"} onClick={onConfirm}>
              {options?.confirmText ?? "تایید"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
