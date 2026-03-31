"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Languages, Loader2, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import type { Translations } from "@/types/translations";

interface DashboardHeaderProps {
  t: Translations;
  language: "latin" | "cyrillic";
  setLanguage: (language: "latin" | "cyrillic") => void;
  filteredClientCount: number;
  loading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  t,
  language,
  setLanguage,
  filteredClientCount,
  loading,
}) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const router = useRouter();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleLogout = () => {
    localStorage.removeItem("dental_clinic_auth");
    router.push("/login");
  };

  return (
    <div className="border-b bg-card transition-colors duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">
              {t.dentalManagement}
            </h1>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              {filteredClientCount} mijoz
            </Badge>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <Select
              value={language}
              onValueChange={(value: "latin" | "cyrillic") =>
                setLanguage(value)
              }
            >
              <SelectTrigger className="w-32">
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
              className="gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Chiqish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;