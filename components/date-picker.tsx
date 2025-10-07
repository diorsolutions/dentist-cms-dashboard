"use client";

import * as React from "react";
import { format } from "date-fns";
import { uz as uzbekLocale } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Import default styles
import { useTheme } from "next-themes"; // Import useTheme

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const { theme } = useTheme(); // Use the theme hook
  const [open, setOpen] = React.useState(false); // Popoverning ochiq holatini boshqarish uchun yangi holat
  const currentYear = new Date().getFullYear();

  // Refined year range logic
  const fromYear = allowPastDates ? currentYear - 100 : currentYear;
  const toYear = allowPastDates ? currentYear : currentYear + 10; // Allow 10 years into the future for non-past dates

  const handleDaySelect = (date?: Date) => {
    onChange(date); // Asl onChange funksiyasini chaqirish
    setOpen(false); // Sana tanlangandan so'ng popoverni yopish
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          {value ? (
            format(value, "dd-MMMM, yyyy", { locale: uzbekLocale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          initialFocus
          locale={uzbekLocale}
          fromDate={allowPastDates ? undefined : new Date()} // Conditionally allow past dates
          captionLayout={showDropdowns ? "dropdown" : "buttons"} // Conditionally show dropdowns
          fromYear={showDropdowns ? fromYear : undefined} // Set fromYear for dropdowns
          toYear={showDropdowns ? toYear : undefined} // Set toYear for dropdowns
          className={cn(
            showDropdowns && "day-picker-custom-dropdowns",
            theme === "dark" && "dark"
          )} // Add dark class here
          // Custom labels for accessibility
          labels={{
            labelMonthDropdown: (month) => {
              // Ensure 'month' is a valid Date object before formatting
              if (!month || isNaN(month.getTime())) {
                return "Invalid Date"; // Fallback for invalid date
              }
              const monthName = format(month, "LLLL", { locale: uzbekLocale });
              const monthNumber = format(month, "MM", { locale: uzbekLocale });
              return `${monthName}-(${monthNumber})`;
            },
            labelYearDropdown: () => "Yilni tanlang",
            labelNext: () => "Keyingi oy",
            labelPrevious: () => "Oldingi oy",
            labelDay: (day) =>
              format(day, "dd MMMM yyyy", { locale: uzbekLocale }),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}