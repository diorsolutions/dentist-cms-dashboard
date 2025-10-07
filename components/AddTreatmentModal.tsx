"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Translations } from "@/types/translations";

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
      <DialogContent className="max-w-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle>Yangi muolaja qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

        <DialogFooter className="gap-2">
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