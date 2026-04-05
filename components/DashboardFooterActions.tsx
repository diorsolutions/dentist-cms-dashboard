"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, RotateCcw, Trash2, Loader2 } from "lucide-react";
import type { Translations } from "@/types/translations";

interface DashboardFooterActionsProps {
  t: Translations;
  setIsAddClientOpen: (isOpen: boolean) => void;
  markAsCompleted: () => Promise<void>;
  changeStatusToInTreatment: () => Promise<void>;
  deleteClients: () => Promise<void>;
  selectedClientCount: number;
  loading: boolean;
  allSelectedAreCompleted: boolean;
  allSelectedAreInTreatment: boolean;
  totalClientsEver: number;
}

const DashboardFooterActions: React.FC<DashboardFooterActionsProps> = ({
  t,
  setIsAddClientOpen,
  markAsCompleted,
  changeStatusToInTreatment,
  deleteClients,
  selectedClientCount,
  loading,
  allSelectedAreCompleted,
  allSelectedAreInTreatment,
  totalClientsEver,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-xl border-t border-border/40 z-50 p-3 sm:p-4 animate-in slide-in-from-bottom-5 duration-500 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="container mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4 max-w-5xl">
        <Button
          onClick={() => setIsAddClientOpen(true)}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 h-11 px-4 sm:px-6 shrink-0 shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden xs:inline font-bold">{t.addNewClient}</span>
          <span className="xs:hidden font-bold">Mijoz</span>
        </Button>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial justify-end sm:justify-start">
          {/* Smart Mark as Completed Button */}
          <Button
            variant="outline"
            onClick={markAsCompleted}
            disabled={
              selectedClientCount === 0 || loading || allSelectedAreCompleted
            }
            className="flex items-center gap-1.5 sm:gap-2 h-11 px-3 sm:px-4 text-green-600 border-green-200/50 hover:bg-green-500/10 dark:text-green-400 dark:border-green-900/50 dark:hover:bg-green-500/20 bg-background/50 disabled:opacity-30 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
            <span className="hidden lg:inline font-medium">{t.markCompleted}</span>
            <span className="text-xs sm:text-sm font-bold">({selectedClientCount})</span>
          </Button>

          {/* Smart Back to Treatment Button */}
          <Button
            variant="outline"
            onClick={changeStatusToInTreatment}
            disabled={
              selectedClientCount === 0 || loading || allSelectedAreInTreatment
            }
            className="flex items-center gap-1.5 sm:gap-2 h-11 px-3 sm:px-4 text-blue-600 border-blue-200/50 hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-500/20 bg-background/50 disabled:opacity-30 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-5 w-5" />
            )}
            <span className="hidden lg:inline font-medium">Qayta davolash</span>
            <span className="text-xs sm:text-sm font-bold">({selectedClientCount})</span>
          </Button>

          <Button
            variant="outline"
            onClick={deleteClients}
            disabled={selectedClientCount === 0 || loading}
            className="flex items-center gap-1.5 sm:gap-2 h-11 px-3 sm:px-4 text-red-600 border-red-200/50 hover:bg-red-500/10 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-500/20 bg-background/50 disabled:opacity-30 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            <span className="hidden lg:inline font-medium">{t.delete}</span>
            <span className="text-xs sm:text-sm font-bold">({selectedClientCount})</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFooterActions;