"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ImageIcon, X } from "lucide-react";
import type { Translations } from "@/types/translations";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker"; // Import the new DatePicker

interface NewTreatmentState {
  visitType: string;
  description: string;
  nextVisitDate?: Date;
  nextVisitNotes: string;
  images: { file: File; comment: string }[] | null;
}

interface AddTreatmentModalProps {
  t: Translations;
  isAddTreatmentOpen: boolean;
  setIsAddTreatmentOpen: (isOpen: boolean) => void;
  newTreatment: NewTreatmentState;
  setNewTreatment: React.Dispatch<React.SetStateAction<NewTreatmentState>>;
  handleAddTreatment: () => Promise<void>;
  loading: boolean;
  currentTheme: string | undefined;
  getTodayForInput: () => string; // Still needed for min date logic if we want to enforce it
}

const AddTreatmentModal: React.FC<AddTreatmentModalProps> = ({
  t,
  isAddTreatmentOpen,
  setIsAddTreatmentOpen,
  newTreatment,
  setNewTreatment,
  handleAddTreatment,
  loading,
  currentTheme,
  getTodayForInput,
}) => {
  const resetForm = () => {
    setNewTreatment({
      visitType: "",
      // treatmentType: "", // Removed
      description: "",
      // notes: "", // Removed
      nextVisitDate: undefined,
      nextVisitNotes: "",
      images: null,
    });
    setIsAddTreatmentOpen(false);
  };

  return (
    <Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
      <DialogContent className={cn("w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6")}>
        <DialogHeader className="pb-6">
          <DialogTitle>{t.addTreatment}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="visitType" className="text-gray-300">
              {t.visitTypeLabel} *
            </Label>
            <Input
              id="visitType"
              value={newTreatment.visitType}
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  visitType: e.target.value,
                }))
              }
              placeholder="Bugun qanday tashrif bo'ldi? (Masalan: Konsultatsiya, Tish olib tashlash)"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">
              {t.treatmentDescription}
            </Label>
            <Textarea
              id="description"
              value={newTreatment.description}
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Muolaja haqida qisqacha tavsif..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="nextVisitDate" className="text-gray-300">
              {t.nextVisitDate}
            </Label>
            <DatePicker
              value={newTreatment.nextVisitDate}
              onChange={(date) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  nextVisitDate: date,
                }))
              }
              placeholder={t.nextVisitDate}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Faqat bugun va bugundan keyingi sanalarni tanlash mumkin
            </p>
          </div>

          <div>
            <Label htmlFor="nextVisitNotes" className="text-gray-300">
              {t.nextVisitNotesLabel}
            </Label>
            <Textarea
              id="nextVisitNotes"
              value={newTreatment.nextVisitNotes}
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  nextVisitNotes: e.target.value,
                }))
              }
              placeholder="Keyingi tashrif uchun reja yoki eslatmalar..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">{t.uploadImage}</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    const newImages = Array.from(files).map((file) => ({
                      file,
                      comment: "",
                    }));
                    setNewTreatment((prev) => ({
                      ...prev,
                      images: [...(prev.images || []), ...newImages],
                    }));
                  }
                }}
                className="hidden"
                id="treatment-image-upload"
              />
              <label htmlFor="treatment-image-upload" className="cursor-pointer">
                <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Rasmlarni yuklash uchun bosing
                </p>
              </label>
            </div>

            {newTreatment.images && newTreatment.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {newTreatment.images.map((imgObj, index) => (
                  <div key={index} className="relative group border rounded-lg p-2 bg-muted/30">
                    <div className="aspect-square bg-muted rounded-md overflow-hidden border mb-2 h-20 w-auto mx-auto">
                      <img
                        src={URL.createObjectURL(imgObj.file) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Input
                      value={imgObj.comment}
                      onChange={(e) => {
                        const newImages = [...(newTreatment.images || [])];
                        newImages[index].comment = e.target.value;
                        setNewTreatment((prev) => ({ ...prev, images: newImages }));
                      }}
                      placeholder={t.imageComment}
                      className="h-7 text-[10px]"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newImages = (newTreatment.images || []).filter((_, i) => i !== index);
                        setNewTreatment((prev) => ({ ...prev, images: newImages.length > 0 ? newImages : null }));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={resetForm} disabled={loading}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleAddTreatment}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t.saving}
              </>
            ) : (
              t.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTreatmentModal;
