"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
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