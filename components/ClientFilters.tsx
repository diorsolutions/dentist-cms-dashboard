"use client";

import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, RotateCcw } from "lucide-react";
import type { Translations } from "@/types/translations";
import { DatePicker } from "@/components/date-picker"; // Import DatePicker
import { format } from "date-fns"; // Import format for date conversion

type SortDirection = "asc" | "desc";
type FilterAndSortField = "name" | "phone" | "lastVisit" | "nextAppointment" | "dateOfBirth"; // Removed email

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
  handleApplySearch: () => void;
  onResetFilters: () => void;
  isFilterActive: boolean;
  lastVisitFilterDate: Date | undefined; // New prop
  setLastVisitFilterDate: (date: Date | undefined) => void; // New prop
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
  handleApplySearch,
  onResetFilters,
  isFilterActive,
  lastVisitFilterDate, // Destructure new prop
  setLastVisitFilterDate, // Destructure new prop
}) => {
  // Local state for phone number parts
  const [localPhoneCode, setLocalPhoneCode] = useState(""); // e.g., 91
  const [localPhoneMiddle, setLocalPhoneMiddle] = useState(""); // e.g., 843
  const [localPhoneLast, setLocalPhoneLast] = useState(""); // e.g., 2324

  const isInternalChange = useRef(false); // Flag to track if searchTerm change originated from local phone inputs

  // Effect to combine local phone parts and update parent searchTerm
  useEffect(() => {
    if (currentFilterAndSortField === "phone") {
      const combinedPhone = `${localPhoneCode}${localPhoneMiddle}${localPhoneLast}`;
      // Only update parent searchTerm if it's different to avoid unnecessary re-renders
      if (combinedPhone !== searchTerm) {
        isInternalChange.current = true; // Mark as internal change
        handleSearchInputChange(combinedPhone);
      }
    }
  }, [localPhoneCode, localPhoneMiddle, localPhoneLast, currentFilterAndSortField, handleSearchInputChange, searchTerm]);

  // Effect to sync local phone parts with parent searchTerm when switching to phone filter
  // OR when searchTerm changes externally (e.g., reset filters)
  useEffect(() => {
    if (currentFilterAndSortField === "phone") {
      if (isInternalChange.current) {
        isInternalChange.current = false; // Reset flag
        return; // Skip parsing if change was internal
      }

      const cleaned = searchTerm.replace(/\D/g, ''); // Remove non-digits
      setLocalPhoneCode(cleaned.substring(0, 2));
      setLocalPhoneMiddle(cleaned.substring(2, 5));
      setLocalPhoneLast(cleaned.substring(5, 9));
    } else {
      // Clear local phone parts when switching away from phone filter
      setLocalPhoneCode("");
      setLocalPhoneMiddle("");
      setLocalPhoneLast("");
    }
  }, [currentFilterAndSortField, searchTerm]); // searchTerm is still a dependency, but guarded by isInternalChange

  const getPlaceholderText = (field: FilterAndSortField): string => {
    switch (field) {
      case "name":
        return t.searchByName;
      case "phone":
        return t.searchByPhone; // This will not be used for the individual inputs
      case "lastVisit":
        return t.searchByLastVisitDate; // Use specific placeholder for date picker
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
        return "tel";
      case "lastVisit":
        return "text"; // DatePicker handles the input, but type is text for consistency
      case "nextAppointment":
      case "dateOfBirth":
        return "text";
      default:
        return "text";
    }
  };

  const getMaxLength = (field: FilterAndSortField): number | undefined => {
    if (field === "phone") return 13;
    return undefined;
  };

  const getMinLength = (field: FilterAndSortField): number | undefined => {
    return undefined;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentFilterAndSortField !== "phone" && currentFilterAndSortField !== "lastVisit") { // Only apply search on Enter for non-live search fields
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
              setSearchTerm(""); // Clear input field in parent
              setLastVisitFilterDate(undefined); // Clear date picker value
              handleApplySearch(); // Trigger immediate search with empty term
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.filterBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t.filterByName}</SelectItem>
              <SelectItem value="phone">{t.filterByPhone}</SelectItem>
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

          {/* Search Input(s) */}
          {currentFilterAndSortField === "phone" ? (
            <div className="flex items-center gap-1 flex-1">
              <span className="text-muted-foreground whitespace-nowrap">+998</span>
              <Input
                type="tel"
                placeholder="XX"
                value={localPhoneCode}
                onChange={(e) => setLocalPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 2))}
                maxLength={2}
                className="w-16 text-center"
              />
              <Input
                type="tel"
                placeholder="XXX"
                value={localPhoneMiddle}
                onChange={(e) => setLocalPhoneMiddle(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
                className="w-20 text-center"
              />
              <Input
                type="tel"
                placeholder="XXXX"
                value={localPhoneLast}
                onChange={(e) => setLocalPhoneLast(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="w-24 text-center"
              />
            </div>
          ) : currentFilterAndSortField === "lastVisit" ? (
            <div className="flex-1">
              <DatePicker
                value={lastVisitFilterDate}
                onChange={(date) => {
                  setLastVisitFilterDate(date);
                  // When date is selected, update searchTerm to trigger debounced search
                  // This will update appliedSearchTerm in dashboard, triggering loadClients
                  handleSearchInputChange(date ? format(date, "yyyy-MM-dd") : "");
                }}
                placeholder={t.searchByLastVisitDate}
                allowPastDates={true}
                showDropdowns={true}
              />
            </div>
          ) : (
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
              {/* Only show search button for non-live search fields */}
              {currentFilterAndSortField !== "phone" && currentFilterAndSortField !== "lastVisit" && (
                <Button onClick={handleApplySearch} className="shrink-0">
                  {t.searchPlaceholder.replace("...", "")}
                </Button>
              )}
            </div>
          )}

          {/* PDF Download */}
          {selectedClientCount > 0 && (
            <Button onClick={generatePDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t.downloadPDF}
            </Button>
          )}

          {/* Reset Filters Button */}
          {isFilterActive && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950 bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
              {t.resetFilters}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFilters;