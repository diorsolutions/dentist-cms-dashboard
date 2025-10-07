"use client";

import * as React from "react";
import { format } from "date-fns";
import { uz as uzbekLocale } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Import default styles

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  allowPastDates?: boolean; // New prop
  showDropdowns?: boolean; // New prop
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Sanani tanlang",
  disabled = false,
  allowPastDates = false, // Default to false (restrict past dates)
  showDropdowns = false, // Default to false (no dropdowns)
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy", { locale: uzbekLocale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={uzbekLocale}
          fromDate={allowPastDates ? undefined : new Date()} // Conditionally allow past dates
          captionLayout={showDropdowns ? "dropdown" : "buttons"} // Conditionally show dropdowns
          // Custom labels for accessibility
          labels={{
            labelMonthDropdown: () => "Oyni tanlang",
            labelYearDropdown: () => "Yilni tanlang",
            labelNext: () => "Keyingi oy",
            labelPrevious: () => "Oldingi oy",
            labelDay: (day) => format(day, "dd MMMM yyyy", { locale: uzbekLocale }),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}