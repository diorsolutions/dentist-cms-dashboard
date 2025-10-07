"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  ZoomIn,
  X,
  Loader2,
  User, // Added
  Phone, // Added
  Mail, // Added
  Calendar, // Added
  MapPin, // Added
  Stethoscope, // Added
  FileText, // Added
  Clock, // Added
} from "lucide-react";
import UploadService from "@/services/uploadService";
import type { Translations } from "@/types/translations";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/utils/date-formatter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Import Card components

interface TreatmentRecord {
  _id?: string;
  id: string;
  treatmentDate: string;
  visitType: string;
  treatmentType: string;
  doctor: string;
  cost: number;
  description: string;
  notes: string;
  nextVisitDate: string | null;
  nextVisitNotes: string;
  images?: string[];
}

interface Client {
  _id?: string;
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string | null;
  nextAppointment: string | null;
  status: "inTreatment" | "completed";
  treatment: string;
  notes: string;
  age: number | null;
  dateOfBirth: string | null;
  address: string;
  treatmentHistory: TreatmentRecord[];
  uploadedImages?: string[];
  uploadedFiles?: {
    images?: string[];
  };
  images?: string[];
  firstName?: string;
  lastName?: string;
  initialTreatment?: string;
}

interface ClientDetailsModalProps {
  t: Translations;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  selectedClient: Client | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expandedTreatment: string | null;
  setExpandedTreatment: (id: string | null) => void;
  setIsAddTreatmentOpen: (isOpen: boolean) => void;
  formatDate: (dateString: string | null) => string;
  getStatusColor: (status: string) => string;
  setPreviewImage: (imageUrl: string | null) => void;
  loadingTreatments: boolean;
}

const ImagePreview = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) => (
  <div className="relative group cursor-pointer" onClick={onClick}>
    <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors">
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-full object-cover hover:scale-105 transition-transform"
      />
    </div>
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </div>
);

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  t,
  isModalOpen,
  setIsModalOpen,
  selectedClient,
  activeTab,
  setActiveTab,
  expandedTreatment,
  setExpandedTreatment,
  setIsAddTreatmentOpen,
  formatDate,
  getStatusColor,
  setPreviewImage,
  loadingTreatments,
}) => {
  const clientAge = selectedClient?.dateOfBirth
    ? calculateAge(selectedClient.dateOfBirth)
    : null;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent
        className={cn("sm:max-w-4xl max-h-[90vh] overflow-y-auto")}
      >
        <DialogHeader className="pb-6">
          <div>
            <DialogTitle className="text-2xl font-bold">
              {selectedClient?.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        {selectedClient && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 h-101">
              <TabsTrigger
                value="info"
                className="transition-all duration-200 text-base py-3"
              >
                {t.clientInfo}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="transition-all duration-200 text-base py-3"
              >
                {t.treatmentHistory}
                {loadingTreatments && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="info"
              className="space-y-6 mt-4 animate-in fade-in-50 duration-300"
            >
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-primary" />
                    {t.clientInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-4 w-4" /> {t.name}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {selectedClient.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {t.birthDate}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {formatDate(selectedClient.dateOfBirth)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {t.ageCalculated}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {clientAge !== null ? clientAge : t.notSpecified}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {t.address}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {selectedClient.address || t.notSpecified}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Phone className="h-5 w-5 text-primary" />
                    {t.phoneNumber} & {t.email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {t.phone}
                    </Label>
                    <a
                      href={`tel:${selectedClient.phone}`}
                      className="text-base font-semibold text-blue-600 hover:underline"
                    >
                      {selectedClient.phone}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {t.email}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {selectedClient.email || t.notSpecified}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-white/80">
                    <Stethoscope className="h-5 w-5 text-white/90" />
                    {t.treatment}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-white/50 flex items-center gap-1">
                      <FileText className="h-4 w-4 text-white/50" /> {t.initialTreatment}
                    </Label>
                    <p className="text-base font-semibold text-white/70">
                      {selectedClient.treatment || t.notSpecified}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {t.status}
                    </Label>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {t[selectedClient.status]}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {t.lastVisit}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {formatDate(selectedClient.lastVisit)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {t.nextAppointment}
                    </Label>
                    <p className="text-base font-semibold text-foreground">
                      {formatDate(selectedClient.nextAppointment)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    {t.clientNotes}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-semibold text-foreground">
                    {selectedClient.notes || t.notSpecified}
                  </p>
                </CardContent>
              </Card>

              {/* Images Gallery Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    {t.uploadedImages}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.uploadedFiles?.images &&
                  selectedClient.uploadedFiles.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedClient.uploadedFiles.images.map(
                        (image, index) => (
                          <ImagePreview
                            key={index}
                            src={
                              UploadService.getImageUrl(image) ||
                              "/placeholder.svg"
                            }
                            alt={`Mijoz rasmi ${index + 1}`}
                            onClick={() =>
                              setPreviewImage(UploadService.getImageUrl(image))
                            }
                          />
                        )
                      )}
                    </div>
                  ) : selectedClient.images &&
                    selectedClient.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedClient.images.map((image, index) => (
                        <ImagePreview
                          key={index}
                          src={
                            UploadService.getImageUrl(image) ||
                            "/placeholder.svg"
                          }
                          alt={`Mijoz rasmi ${index + 1}`}
                          onClick={() =>
                            setPreviewImage(UploadService.getImageUrl(image))
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground text-lg">
                        {t.noImagesUploaded}
                      </p>
                      <p className="text-muted-foreground/70 text-sm mt-2">
                        Mijoz qo'shish vaqtida rasm yuklash mumkin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="history"
              className="space-y-6 mt-4 animate-in fade-in-50 duration-300"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {t.treatmentHistory} ({selectedClient.treatmentHistory.length}{" "}
                  ta muolaja)
                </h3>
                <Button
                  onClick={() => setIsAddTreatmentOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  {t.addTreatment}
                </Button>
              </div>

              {loadingTreatments ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">
                    Muolaja tarixi yuklanmoqda...
                  </p>
                </div>
              ) : selectedClient.treatmentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.noTreatmentHistory}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedClient.treatmentHistory.map((treatment, index) => (
                    <Collapsible
                      key={treatment.id}
                      open={expandedTreatment === treatment.id}
                    >
                      <CollapsibleTrigger
                        className="flex items-center justify-between w-full p-5 border rounded-lg hover:bg-muted/50 transition-all duration-200"
                        onClick={() =>
                          setExpandedTreatment(
                            expandedTreatment === treatment.id
                              ? null
                              : treatment.id
                          )
                        }
                      >
                        <div className="flex items-center gap-4">
                          {/* Treatment number: total_treatments - index */}
                          <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                            {selectedClient.treatmentHistory.length - index}
                          </div>
                          <div className="text-left">
                            <div className="text-base font-medium text-foreground">
                              {formatDate(treatment.treatmentDate)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t.lastVisit}
                            </div>
                          </div>
                        </div>
                        {expandedTreatment === treatment.id ? (
                          <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-5 w-5 transition-transform duration-200" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-5 pb-5 space-y-4 pt-4 border-t">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium text-base">
                                {t.visitTypeLabel}:
                              </span>
                              <div className="text-muted-foreground text-base">
                                {treatment.visitType || t.notSpecified}
                              </div>
                            </div>
                          </div>

                          {treatment.description && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  {t.treatmentDescription}:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.description}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium text-base">
                                {t.nextVisitDate}:
                              </span>
                              <div className="text-muted-foreground text-base">
                                {treatment.nextVisitDate
                                  ? formatDate(treatment.nextVisitDate)
                                  : t.notSpecified}
                              </div>
                            </div>
                          </div>

                          {treatment.nextVisitNotes && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  {t.nextVisitNotesLabel}:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.nextVisitNotes}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>
                              {t.createdOn}:{" "}
                              {formatDate(treatment.treatmentDate)}
                            </span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;