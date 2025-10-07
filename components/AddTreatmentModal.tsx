"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Translations } from "@/types/translations";
import { cn } from "@/lib/utils"; // Import cn utility

interface NewTreatmentState {
  visit: string;
  treatment: string;
  notes: string;
  nextVisitDate: string;
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
  getTodayForInput: () => string;
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
      visit: "",
      treatment: "",
      notes: "",
      nextVisitDate: "",
      images: null,
    });
    setIsAddTreatmentOpen(false);
  };

  return (
    <Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto", // Add max-h and overflow for consistency
          "sm:top-[50%] sm:translate-y-[-50%] top-0 translate-y-0",
          "sm:max-w-2xl max-w-full",
          "sm:rounded-lg rounded-none",
          "sm:p-6 p-0",
          "data-[state=open]:sm:slide-in-from-top-[48%] data-[state=open]:slide-in-from-bottom-full",
          "data-[state=closed]:sm:slide-out-to-top-[48%] data-[state=closed]:slide-out-to-bottom-full",
          "animate-in fade-in-0 zoom-in-95 duration-300"
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-6">
          <DialogTitle>Yangi muolaja qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6">
          <div>
            <Label htmlFor="visit">Bugungi tashrif *</Label>
            <Input
              id="visit"
              value={newTreatment.visit}
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  visit: e.target.value,
                }))
              }
              placeholder="Bugun qanday muolaja qilindi?"
            />
          </div>

          <div>
            <Label htmlFor="treatment">Keyingi tashrif uchun reja *</Label>
            <Input
              id="treatment"
              value={newTreatment.treatment}
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  treatment: e.target.value,
                }))
              }
              placeholder="Keyingi safar nima qilish kerak?"
            />
          </div>

          <div>
            <Label htmlFor="notes">Qo'shimcha izohlar</Label>
            <Textarea
              id="notes"
              value={newTreatment.notes}
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Batafsil izoh..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="nextVisitDate">Keyingi tashrif sanasi</Label>
            <Input
              id="nextVisitDate"
              type="date"
              value={newTreatment.nextVisitDate}
              min={getTodayForInput()}
              lang="uz-UZ"
              onChange={(e) =>
                setNewTreatment((prev) => ({
                  ...prev,
                  nextVisitDate: e.target.value,
                }))
              }
              placeholder="dd/mm/yyyy"
              style={{
                colorScheme: currentTheme === "dark" ? "dark" : "light",
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Faqat bugun va bugundan keyingi sanalarni tanlash mumkin
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 px-6 py-4">
          <Button variant="outline" onClick={resetForm} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleAddTreatment}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saqlanmoqda...
              </>
            ) : (
              "Saqlash"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTreatmentModal;