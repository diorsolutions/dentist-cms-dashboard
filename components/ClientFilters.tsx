"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download } from "lucide-react";
import type { Translations } from "@/types/translations";

type SortDirection = "asc" | "desc";
type FilterAndSortField = "name" | "phone" | "email" | "lastVisit" | "nextAppointment" | "dateOfBirth";

interface ClientFiltersProps {
  t: Translations;
  currentFilterAndSortField: FilterAndSortField;
  setCurrentFilterAndSortField: (field: FilterAndSortField) => void;
  currentSortDirection: SortDirection;
  setCurrentSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchInputChange: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedClientCount: number;
  generatePDF: () => void;
  handleApplySearch: () => void; // New prop for triggering search
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
  t,
  currentFilterAndSortField,
  setCurrentFilterAndSortField,
  currentSortDirection,
  setCurrentSortDirection,
  searchTerm,
  setSearchTerm,
  handleSearchInputChange,
  statusFilter,
  setStatusFilter,
  selectedClientCount,
  generatePDF,
  handleApplySearch, // Destructure new prop
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
      case "nextAppointment":
      case "dateOfBirth":
        return t.searchByBirthDate;
      default:
        return t.searchPlaceholder;
    }
  };

  const getInputType = (field: FilterAndSortField): string => {
    switch (field) {
      case "phone":
        return "tel"; // Use 'tel' for phone numbers, it allows '+' and numbers
      case "lastVisit":
      case "nextAppointment":
      case "dateOfBirth":
        return "text"; // Date inputs are handled as text for search
      default:
        return "text";
    }
  };

  const getMaxLength = (field: FilterAndSortField): number | undefined => {
    if (field === "phone") return 13; // +998XXXXXXXXX
    return undefined;
  };

  const getMinLength = (field: FilterAndSortField): number | undefined => {
    // Removed minLength for phone as per user request
    return undefined;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplySearch();
    }
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
              setSearchTerm(""); // Clear input field
              // Removed handleApplySearch() here to prevent immediate request
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
              <SelectItem value="dateOfBirth">{t.filterByBirthDate}</SelectItem>
            </SelectContent>
          </Select>

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
          <div className="relative flex-1 flex items-center gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={getInputType(currentFilterAndSortField)}
              placeholder={getPlaceholderText(currentFilterAndSortField)}
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 w-full"
              maxLength={getMaxLength(currentFilterAndSortField)}
              minLength={getMinLength(currentFilterAndSortField)}
            />
            <Button onClick={handleApplySearch} className="shrink-0">
              {t.searchPlaceholder.replace("...", "")}
            </Button>
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