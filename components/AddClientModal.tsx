"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, ImageIcon, Loader2, X } from "lucide-react";
import type { Translations } from "@/types/translations";
import { cn } from "@/lib/utils"; // Import cn utility
import { DatePicker } from "@/components/date-picker"; // Import the DatePicker component

interface NewClientState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  age: string;
  dateOfBirth?: Date; // New field
  address: string;
  treatment: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AddClientModalProps {
  t: Translations;
  isAddClientOpen: boolean;
  setIsAddClientOpen: (isOpen: boolean) => void;
  newClient: NewClientState;
  setNewClient: React.Dispatch<React.SetStateAction<NewClientState>>;
  uploadedImages: File[];
  setUploadedImages: React.Dispatch<React.SetStateAction<File[]>>;
  isSubmitting: boolean;
  handleAddClient: () => Promise<void>;
  formErrors: FormErrors;
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  handlePhoneChange: (value: string) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  t,
  isAddClientOpen,
  setIsAddClientOpen,
  newClient,
  setNewClient,
  uploadedImages,
  setUploadedImages,
  isSubmitting,
  handleAddClient,
  formErrors,
  setFormErrors,
  handlePhoneChange,
}) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewClient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      age: "",
      dateOfBirth: undefined, // Reset new field
      address: "",
      treatment: "",
      notes: "",
    });
    setUploadedImages([]);
    setFormErrors({});
    setIsAddClientOpen(false);
  };

  return (
    <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
      <DialogContent
        className={cn(
          "sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        )}
      >
        <DialogHeader className="pb-6">
          <DialogTitle>{t.addNewClientTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t.firstName} *</Label>
              <Input
                id="firstName"
                value={newClient.firstName}
                onChange={(e) => {
                  setNewClient((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }));
                  if (formErrors.firstName) {
                    setFormErrors((prev) => ({ ...prev, firstName: "" }));
                  }
                }}
                placeholder={t.firstName}
                className={formErrors.firstName ? "border-red-500" : ""}
              />
              {formErrors.firstName && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">{t.lastName} *</Label>
              <Input
                id="lastName"
                value={newClient.lastName}
                onChange={(e) => {
                  setNewClient((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }));
                  if (formErrors.lastName) {
                    setFormErrors((prev) => ({ ...prev, lastName: "" }));
                  }
                }}
                placeholder={t.lastName}
                className={formErrors.lastName ? "border-red-500" : ""}
              />
              {formErrors.lastName && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.lastName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">{t.phoneNumber} *</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+998901234567"
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.phone}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => {
                  setNewClient((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  if (formErrors.email) {
                    setFormErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="email@example.com"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="age">{t.clientAge}</Label>
              <Input
                id="age"
                type="number"
                value={newClient.age}
                onChange={(e) => {
                  setNewClient((prev) => ({ ...prev, age: e.target.value }));
                  if (formErrors.age) {
                    setFormErrors((prev) => ({ ...prev, age: "" }));
                  }
                }}
                placeholder="25"
                min="1"
                max="150"
                className={formErrors.age ? "border-red-500" : ""}
              />
              {formErrors.age && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.age}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dateOfBirth">{t.birthDate}</Label>
              <DatePicker
                value={newClient.dateOfBirth}
                onChange={(date) => {
                  setNewClient((prev) => ({ ...prev, dateOfBirth: date }));
                  if (formErrors.dateOfBirth) {
                    setFormErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                  }
                }}
                placeholder={t.birthDate}
                disabled={isSubmitting}
              />
              {formErrors.dateOfBirth && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">{t.clientAddress}</Label>
            <Input
              id="address"
              value={newClient.address}
              onChange={(e) =>
                setNewClient((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder={t.address}
            />
          </div>

          <div>
            <Label htmlFor="treatment">{t.initialTreatment}</Label>
            <Input
              id="treatment"
              value={newClient.treatment}
              onChange={(e) =>
                setNewClient((prev) => ({
                  ...prev,
                  treatment: e.target.value,
                }))
              }
              placeholder={t.initialTreatment}
            />
          </div>

          <div>
            <Label htmlFor="notes">{t.clientNotes}</Label>
            <Textarea
              id="notes"
              value={newClient.notes}
              onChange={(e) =>
                setNewClient((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder={t.notes}
              rows={3}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>{t.uploadImage}</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Rasmlarni yuklash uchun bosing yoki shu yerga tashlang
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  PNG, JPG, GIF (maksimal 5MB)
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
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
          <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleAddClient}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saqlanmoqda...
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

export default AddClientModal;