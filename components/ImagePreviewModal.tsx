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
          "sm:max-w-4xl max-h-[90vh] overflow-hidden p-0"
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