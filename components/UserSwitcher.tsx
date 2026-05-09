"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Users, ChevronDown, Stethoscope, Trash2 } from "lucide-react";
import AuthService from "@/services/authService";
import { cn } from "@/lib/utils";
import type { Translations } from "@/types/translations";

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

interface UserSwitcherProps {
  t: Translations;
  currentUser: Doctor | null;
  selectedDoctorId: string | "all";
  onDoctorSelect: (doctorId: string | "all") => void;
  onAddDoctorClick: () => void;
  refreshKey?: number;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({
  t,
  currentUser,
  selectedDoctorId,
  onDoctorSelect,
  onAddDoctorClick,
  refreshKey,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isAdmin = AuthService.isAdmin();
  const isDoctor = AuthService.isDoctor();
  const canManage = true; // Barcha foydalanuvchilarga ruxsat berish (USER so'rovi bo'yicha)

  useEffect(() => {
    loadDoctors();
  }, [refreshKey]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      console.log("Loading doctors...");
      const response = await AuthService.getDoctors();
      console.log("Doctors response:", response);
      if (response.success) {
        setDoctors(response.data);
        console.log("Doctors loaded:", response.data.length);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get current user's doctor entry from the list
  const currentUserInList = doctors.find(d => d.id === currentUser?.id);
  const displayName = currentUserInList?.fullName || currentUser?.fullName || "Doktor";

  const handleDeleteDoctor = async (e: React.MouseEvent, doctorId: string, doctorName: string) => {
    e.stopPropagation();
    if (!window.confirm(`${doctorName}ni o'chirib tashlamoqchimisiz?`)) return;

    try {
      setLoading(true);
      const response = await AuthService.deleteDoctor(doctorId);
      if (response.success) {
        await loadDoctors();
      } else {
        alert(response.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Delete doctor error:", error);
      alert("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9 px-3"
          disabled={loading}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-2xl border-border/40 backdrop-blur-xl bg-card/95">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Users className="h-4 w-4 text-blue-500" />
              Doktorlar ({doctors.length})
            </div>
            {doctors.length === 0 && (
              <span className="text-xs text-red-500 font-normal">(Ro'yxat bo'sh)</span>
            )}
          </div>

          {/* Add Doctor button at the TOP now */}
          <button
            onClick={() => {
              onAddDoctorClick();
              setOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-3 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Yangi doktor qo'shish</span>
          </button>

          <Separator className="mb-3 opacity-50" />

          {/* Show doctor list */}
          <ScrollArea className="h-auto max-h-[350px] pr-1">
            <div className="space-y-1">
              {/* All doctors option */}
              <button
                onClick={() => {
                  onDoctorSelect("all");
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  selectedDoctorId === "all"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  selectedDoctorId === "all" ? "bg-blue-500 text-white" : "bg-muted"
                )}>
                  <Users className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 text-left font-semibold">Barcha mijozlar</span>
                {selectedDoctorId === "all" && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-600 uppercase tracking-wider">
                    Tanlangan
                  </Badge>
                )}
              </button>

              <div className="py-3 flex items-center gap-2 px-1">
                <Separator className="flex-1 opacity-30" />
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Shifokorlar ro'yxati</span>
                <Separator className="flex-1 opacity-30" />
              </div>

              {/* Individual doctors */}
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-all duration-200 group border border-transparent ${
                    selectedDoctorId === doctor.id
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-blue-500/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    onDoctorSelect(doctor.id);
                    setOpen(false);
                  }}
                  role="button"
                >
                  <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                    <AvatarFallback className={cn(
                      "text-xs font-bold",
                      selectedDoctorId === doctor.id ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {getInitials(doctor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold truncate leading-tight text-foreground">{doctor.fullName}</p>
                    <p className="text-[10px] text-muted-foreground/70 truncate uppercase tracking-tighter">
                      {doctor.role === "admin" ? "Bosh Shifokor" : "Doktor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedDoctorId === doctor.id && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-600 uppercase tracking-wider">
                        Aktiv
                      </Badge>
                    )}
                    <button
                      onClick={(e) => handleDeleteDoctor(e, doctor.id, doctor.fullName)}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm border border-red-500/10 hover:border-red-500"
                      title="Doktorni o'chirish"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserSwitcher;
