"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Translations } from "@/types/translations";

interface Client {
  id: number;
  _id?: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  status: "inTreatment" | "completed";
  treatment: string;
  notes: string;
  age: number;
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
  dateOfBirth?: string;
}

interface ClientTableProps {
  t: Translations;
  filteredAndSortedClients: Client[];
  loading: boolean;
  selectedClients: number[];
  handleSelectAll: (checked: boolean) => void;
  handleClientSelect: (clientId: number, checked: boolean) => void;
  openClientModal: (client: Client) => Promise<void>;
  formatDate: (dateString: string) => string;
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
        <div className="grid grid-cols-11 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div className="col-span-1">
            {selectedClients.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedClients.length === filteredAndSortedClients.length &&
                    filteredAndSortedClients.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  ({selectedClients.length})
                </Label>
              </div>
            )}
          </div>
          <div className="col-span-3">
            <span className="font-medium">{t.name}</span>
          </div>
          <div className="col-span-2">{t.lastVisit}</div>
          <div className="col-span-2">{t.nextAppointment}</div>
          <div className="col-span-2">{t.phone}</div>
          <div className="col-span-1">{t.status}</div>
        </div>

        {/* Client Rows */}
        <div className="divide-y">
          {filteredAndSortedClients.map((client, index) => (
            <div
              key={client.id}
              className="grid grid-cols-11 gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 animate-in fade-in-50"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => openClientModal(client)}
            >
              <div
                className="col-span-1 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={(checked) =>
                    handleClientSelect(client.id, checked as boolean)
                  }
                />
              </div>
              <div className="col-span-3 flex items-center">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {client.name}
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                {formatDate(client.lastVisit)}
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                {formatDate(client.nextAppointment)}
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                {client.phone}
              </div>
              <div className="col-span-1 flex items-center">
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