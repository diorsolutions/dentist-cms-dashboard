"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn utility

interface ImagePreviewModalProps {
  previewImage: string | null;
  setPreviewImage: (imageUrl: string | null) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  previewImage,
  setPreviewImage,
}) => {
  return (
    <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden", // Keep max-h and overflow
          "sm:top-[50%] sm:translate-y-[-50%] top-0 translate-y-0", // Align to top on small screens
          "sm:max-w-4xl max-w-full", // Full width on small screens, max-w-4xl on larger
          "sm:rounded-lg rounded-none", // No rounded corners on small screens
          "p-0", // Keep p-0 for image preview
          // Custom animations for small screens (slide from bottom)
          "data-[state=open]:sm:slide-in-from-top-[48%] data-[state=open]:slide-in-from-bottom-full",
          "data-[state=closed]:sm:slide-out-to-top-[48%] data-[state=closed]:slide-out-to-bottom-full",
          "animate-in fade-in-0 zoom-in-95 duration-300" // Keep existing animations
        )}
      >
        <div className="relative">
          <img
            src={previewImage || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewModal;