"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Translations } from "@/types/translations";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker"; // Import the new DatePicker

interface NewTreatmentState {
  visitType: string;
  treatmentType: string;
  description: string;
  notes: string;
  nextVisitDate?: Date; // Changed type to Date
  nextVisitNotes: string;
  images: File[] | null;
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
      treatmentType: "",
      description: "",
      notes: "",
      nextVisitDate: undefined,
      nextVisitNotes: "",
      images: null,
    });
    setIsAddTreatmentOpen(false);
  };

  return (
    <Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
      <DialogContent
        className={cn(
          "sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        )}
      >
        <DialogHeader className="pb-6">
          <DialogTitle>{t.addTreatment}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="visitType">{t.visitTypeLabel} *</Label>
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
            <Label htmlFor="description">{t.treatmentDescription}</Label>
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
            <Label htmlFor="nextVisitDate">{t.nextVisitDate}</Label>
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
            <Label htmlFor="nextVisitNotes">{t.nextVisitNotesLabel}</Label>
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