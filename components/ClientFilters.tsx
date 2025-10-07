"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronDown, ChevronUp, Download } from "lucide-react";
import type { Translations } from "@/types/translations";

type SortDirection = "asc" | "desc";
type FilterAndSortField = "name" | "phone" | "email" | "lastVisit" | "nextAppointment" | "dateOfBirth"; // Added dateOfBirth

interface ClientFiltersProps {
  t: Translations;
  currentFilterAndSortField: FilterAndSortField;
  setCurrentFilterAndSortField: (field: FilterAndSortField) => void;
  currentSortDirection: SortDirection;
  setCurrentSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>; // Updated type here
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedClientCount: number;
  generatePDF: () => void;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
  t,
  currentFilterAndSortField,
  setCurrentFilterAndSortField,
  currentSortDirection,
  setCurrentSortDirection,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedClientCount,
  generatePDF,
}) => {
  const getPlaceholderText = (field: FilterAndSortField): string => {
    switch (field) {
      case "name":
        return t.searchByName;
      case "phone":
        return t.searchByPhone;
      case "email":
        return t.searchByEmail;
      case "lastVisit":
        return t.searchByLastVisitDate;
      case "nextAppointment":
        return t.searchByNextAppointmentDate;
      case "dateOfBirth": // New placeholder
        return t.searchByBirthDate;
      default:
        return t.searchPlaceholder;
    }
  };

  const handleSortToggle = () => {
    setCurrentSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getSortIconComponent = (direction: SortDirection) => {
    return direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <Card className="mb-6 animate-in fade-in-50 duration-300">
      <CardContent className="p-4">
        <div className="w-full flex items-center gap-4">
          {/* Select for Search/Sort Field */}
          <Select
            value={currentFilterAndSortField}
            onValueChange={(value: FilterAndSortField) => {
              setCurrentFilterAndSortField(value);
              setCurrentSortDirection("asc"); // Reset sort direction when field changes
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.filterBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t.filterByName}</SelectItem>
              <SelectItem value="phone">{t.filterByPhone}</SelectItem>
              <SelectItem value="email">{t.filterByEmail}</SelectItem>
              <SelectItem value="lastVisit">{t.filterByLastVisit}</SelectItem>
              <SelectItem value="nextAppointment">
                {t.filterByNextAppointment}
              </SelectItem>
              <SelectItem value="dateOfBirth">{t.filterByBirthDate}</SelectItem> {/* New filter option */}
            </SelectContent>
          </Select>

          {/* Sort Direction Toggle Button */}
          <Button
            variant="outline"
            onClick={handleSortToggle}
            className="flex items-center gap-2 bg-transparent"
          >
            {getSortIconComponent(currentSortDirection)}
          </Button>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              <SelectItem value="inTreatment">{t.inTreatment}</SelectItem>
              <SelectItem value="completed">{t.completed}</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={getPlaceholderText(currentFilterAndSortField)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* PDF Download */}
          {selectedClientCount > 0 && (
            <Button onClick={generatePDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t.downloadPDF}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFilters;