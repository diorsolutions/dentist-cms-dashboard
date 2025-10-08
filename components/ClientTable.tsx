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
    <Card className="animate-in fade-in-50 duration-500">
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-18 px-4 py-2 border-b bg-muted/50 font-medium text-sm relative">
          {/* Select All Checkbox - Absolutely positioned */}
          <div
            className={cn(
              "absolute left-[-1.4rem] top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-200",
              selectedClients.length > 0
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()} // Prevent header click when clicking checkbox
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
          <div className="col-span-1">No.</div> {/* No. column */}
          <div className="col-span-4 pl-2">
            {" "}
            {/* Name column with left padding */}
            <span className="font-medium">{t.name}</span>
          </div>
          <div className="col-span-3 px-2">{t.birthDate}</div>{" "}
          {/* Birth Date column */}
          <div className="col-span-3 px-2">{t.lastVisit}</div>{" "}
          {/* Last Visit column */}
          <div className="col-span-3 px-2">{t.nextAppointment}</div>{" "}
          {/* Next Appointment column */}
          <div className="col-span-2 px-2">{t.phone}</div> {/* Phone column */}
          <div className="col-span-1">
            {" "}
            {/* Status column */}
            {t.status}
          </div>
        </div>

        {/* Client Rows */}
        <div className="divide-y">
          {filteredAndSortedClients.map((client, index) => (
            <div
              key={client.id}
              className="grid grid-cols-18 px-4 py-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 animate-in fade-in-50 group relative" // Added relative and group
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => openClientModal(client)}
            >
              {/* Individual Checkbox - Absolutely positioned outside the grid flow */}
              <div
                className={cn(
                  "absolute left-[-1.4rem] top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-200",
                  selectedClients.includes(client.id)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
              >
                <Checkbox
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={(checked) =>
                    handleClientSelect(client.id, checked as boolean)
                  }
                />
              </div>

              <div className="col-span-1 flex items-center">
                {" "}
                {/* No. column content */}
                <span className="text-sm text-muted-foreground">
                  {index + 1}.
                </span>
              </div>
              {/* Removed the empty div here to close the gap between No. and Name */}
              <div className="col-span-4 flex items-center pl-2">
                {" "}
                {/* Name column content */}
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {client.name}
                  </div>
                </div>
              </div>
              <div className="col-span-3 flex items-center text-sm text-muted-foreground px-2">
                {" "}
                {/* Birth Date content */}
                {formatDate(client.dateOfBirth)}
              </div>
              <div className="col-span-3 flex items-center text-sm text-muted-foreground px-2">
                {" "}
                {/* Last Visit content */}
                {formatDate(client.lastVisit)}
              </div>
              <div className="col-span-3 flex items-center text-sm text-muted-foreground px-2">
                {" "}
                {/* Next Appointment content */}
                {client.nextAppointment ? (
                  <span
                    className={
                      isPast(parseISO(client.nextAppointment))
                        ? "line-through text-red-500"
                        : ""
                    }
                  >
                    {formatDate(client.nextAppointment)}{" "}
                    {isPast(parseISO(client.nextAppointment)) &&
                      "(bo'lib o'tgan)"}
                  </span>
                ) : (
                  t.notSpecified
                )}
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground px-2">
                {" "}
                {/* Phone content */}
                {client.phone}
              </div>
              <div className="col-span-1 flex items-center">
                {" "}
                {/* Status content */}
                <Badge className={getStatusColor(client.status)}>
                  {t[client.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedClients.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground animate-in fade-in-50 duration-300">
            {t.noClientsFound}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">
              Ma'lumotlar yuklanmoqda...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientTable;
