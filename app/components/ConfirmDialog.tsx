"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Confirmar</DialogTitle>
          <DialogDescription className="text-center text-lg pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-center gap-4 sm:justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={onConfirm}
          >
            Sí
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onCancel}
          >
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}