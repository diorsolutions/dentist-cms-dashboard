"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Translations } from "@/types/translations";
import { isPast, parseISO } from "date-fns"; // Import date-fns functions
import { cn } from "@/lib/utils"; // Import cn utility

interface Client {
  id: string; // Changed from number to string
  _id?: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string | null; // Can be null if no visits
  nextAppointment: string | null; // Can be null if no future appointments
  status: "inTreatment" | "completed";
  treatment: string;
  notes: string;
  age: number | null;
  dateOfBirth: string | null; // New field
  address: string;
  treatmentHistory: any[]; // Simplified for now
  uploadedImages?: string[];
  uploadedFiles?: {
    images?: string[];
  };
  images?: string[];
  firstName?: string;
  lastName?: string;
  initialTreatment?: string;
  treatmentCount: number; // Add treatmentCount property
}

interface ClientTableProps {
  t: Translations;
  filteredAndSortedClients: Client[];
  loading: boolean;
  selectedClients: string[]; // Changed from number[] to string[]
  handleSelectAll: (checked: boolean) => void;
  handleClientSelect: (clientId: string, checked: boolean) => void; // Changed clientId type
  openClientModal: (client: Client) => Promise<void>;
  formatDate: (dateString: string | null) => string; // Updated type
  getStatusColor: (status: string) => string;
}

const ClientTable: React.FC<ClientTableProps> = ({
  t,
  filteredAndSortedClients,
  loading,
  selectedClients,
  handleSelectAll,
  handleClientSelect,
  openClientModal,
  formatDate,
  getStatusColor,
}) => {
  return (
    <Card className="animate-in fade-in-50 duration-500 overflow-hidden">
      <CardContent className="p-0">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden lg:grid grid-cols-18 px-4 py-3 border-b bg-muted/50 font-semibold text-sm relative">
          <div
            className={cn(
              "absolute left-[-1.4rem] top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-200",
              selectedClients.length > 0
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              id="select-all"
              checked={
                selectedClients.length === filteredAndSortedClients.length &&
                filteredAndSortedClients.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
          </div>
          <div className="col-span-1">No.</div>
          <div className="col-span-4 pl-2">{t.name}</div>
          <div className="col-span-3 px-2">{t.birthDate}</div>
          <div className="col-span-3 px-2">{t.lastVisit}</div>
          <div className="col-span-3 px-2">{t.nextAppointment}</div>
          <div className="col-span-3 px-2">{t.phone}</div>
          <div className="col-span-1 text-center">{t.status}</div>
        </div>

        {/* Client Rows */}
        <div className="divide-y">
          {filteredAndSortedClients.map((client, index) => (
            <React.Fragment key={client.id}>
              {/* Desktop Row - Hidden on mobile */}
              <div
                className="hidden lg:grid grid-cols-18 px-4 py-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 animate-in fade-in-50 group relative"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => openClientModal(client)}
              >
                <div
                  className={cn(
                    "absolute left-[-1.4rem] top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-200",
                    selectedClients.includes(client.id)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) =>
                      handleClientSelect(client.id, checked as boolean)
                    }
                  />
                </div>

                <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                  {index + 1}.
                </div>
                <div className="col-span-4 flex items-center pl-2">
                  <div className="text-base font-semibold text-foreground truncate">
                    {client.name}
                  </div>
                </div>
                <div className="col-span-3 flex items-center text-sm text-muted-foreground px-2">
                  {formatDate(client.dateOfBirth)}
                </div>
                <div className="col-span-3 flex items-center text-sm text-muted-foreground px-2">
                  {formatDate(client.lastVisit)}
                </div>
                <div className="col-span-3 flex items-center text-sm text-muted-foreground px-2">
                  {client.nextAppointment ? (
                    <span
                      className={
                        isPast(parseISO(client.nextAppointment))
                          ? "line-through text-red-500/80"
                          : "text-foreground font-medium"
                      }
                    >
                      {formatDate(client.nextAppointment)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50 italic">{t.notSpecified}</span>
                  )}
                </div>
                <div className="col-span-3 flex items-center text-sm font-mono text-muted-foreground px-2">
                  {client.phone}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <Badge className={cn(getStatusColor(client.status), "shadow-sm border-none")}>
                    {t[client.status]}
                  </Badge>
                </div>
              </div>

              {/* Mobile Card - Hidden on desktop */}
              <div 
                className="lg:hidden p-4 hover:bg-muted/20 active:bg-muted/40 cursor-pointer transition-colors relative"
                onClick={() => openClientModal(client)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={(checked) =>
                          handleClientSelect(client.id, checked as boolean)
                        }
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground leading-tight">
                        {client.name}
                      </h3>
                      <p className="text-sm font-mono text-muted-foreground mt-0.5">
                        {client.phone}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(getStatusColor(client.status), "shrink-0 shadow-sm border-none text-[10px] px-1.5 py-0")}>
                    {t[client.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-muted/30 p-3 rounded-lg border border-muted-foreground/10">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-bold">
                      {t.lastVisit}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {formatDate(client.lastVisit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-bold">
                      {t.nextAppointment}
                    </p>
                    <p className={cn(
                      "text-sm font-medium truncate",
                      client.nextAppointment && isPast(parseISO(client.nextAppointment)) ? "text-red-500" : ""
                    )}>
                      {client.nextAppointment ? formatDate(client.nextAppointment) : t.notSpecified}
                    </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {filteredAndSortedClients.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground animate-in fade-in-50 duration-300">
            <p className="text-lg font-medium">{t.noClientsFound}</p>
            <p className="text-sm opacity-50 mt-1">Qidiruv shartlarini o'zgartirib ko'ring</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4 font-medium animate-pulse">
              Ma'lumotlar yuklanmoqda...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientTable;
