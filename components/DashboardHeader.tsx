"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Languages, Loader2, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import type { Translations } from "@/types/translations";
import UserSwitcher from "./UserSwitcher";

interface Doctor {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  role: "admin" | "doctor" | "assistant";
  lastLogin: string;
}

interface DashboardHeaderProps {
  t: Translations;
  language: "latin" | "cyrillic";
  setLanguage: (language: "latin" | "cyrillic") => void;
  filteredClientCount: number;
  loading: boolean;
  currentUser: Doctor | null;
  selectedDoctorId: string | "all";
  onDoctorSelect: (doctorId: string | "all") => void;
  onAddDoctorClick: () => void;
  doctorsRefreshKey?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  t,
  language,
  setLanguage,
  filteredClientCount,
  loading,
  currentUser,
  selectedDoctorId,
  onDoctorSelect,
  onAddDoctorClick,
  doctorsRefreshKey,
}) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const router = useRouter();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleLogout = () => {
    localStorage.removeItem("dental_clinic_auth");
    router.push("/login");
  };

  return (
    <div className="border-b bg-card transition-colors duration-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                {t.dentalManagement}
              </h1>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hidden sm:flex shrink-0"
              >
                {filteredClientCount} mijoz
              </Badge>
              {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-muted-foreground" />}
            </div>
            
            {/* Mobile-only badge */}
            <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 sm:hidden"
              >
                {filteredClientCount}
            </Badge>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
            {/* User Switcher */}
            <UserSwitcher
              t={t}
              currentUser={currentUser}
              selectedDoctorId={selectedDoctorId}
              onDoctorSelect={onDoctorSelect}
              onAddDoctorClick={onAddDoctorClick}
              refreshKey={doctorsRefreshKey}
            />

            {/* Language Selector */}
            <Select
              value={language}
              onValueChange={(value: "latin" | "cyrillic") =>
                setLanguage(value)
              }
            >
              <SelectTrigger className="w-full sm:w-32 h-9">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latin">{t.uzbekLatin}</SelectItem>
                <SelectItem value="cyrillic">{t.uzbekCyrillic}</SelectItem>
              </SelectContent>
            </Select>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
              }
              className="shrink-0 h-9 w-9"
            >
              {currentTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-transparent shrink-0 h-9"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">Chiqish</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;