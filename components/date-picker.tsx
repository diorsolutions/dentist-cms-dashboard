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
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Sanani tanlang",
  disabled = false,
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
          fromDate={new Date()} // Prevent selecting past dates
          formatters={{
            formatCaption: (date, options) => {
              const y = date.getFullYear();
              const m = options?.locale?.localize?.month(date.getMonth(), { width: 'long' });
              return `${m} ${y}`;
            },
            formatWeekdayName: (day, options) => options?.locale?.localize?.weekday(day.getDay(), { width: 'short' }) || '',
            formatMonthCaption: (date, options) => options?.locale?.localize?.month(date.getMonth(), { width: 'long' }) || '',
          }}
          format={{
            day: (date) => format(date, "d", { locale: uzbekLocale }),
            monthCaption: (date) => format(date, "LLLL yyyy", { locale: uzbekLocale }),
          }}
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