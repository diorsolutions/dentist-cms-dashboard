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
    <div className="mt-6 flex items-center justify-between animate-in fade-in-50 duration-700">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.addNewClient}
        </Button>

        {/* Smart Mark as Completed Button - only enabled for inTreatment clients */}
        <Button
          variant="outline"
          onClick={markAsCompleted}
          disabled={
            selectedClientCount === 0 || loading || allSelectedAreCompleted
          }
          className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950 bg-transparent disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {t.markCompleted} ({selectedClientCount})
        </Button>

        {/* Smart Back to Treatment Button - only enabled for completed clients */}
        <Button
          variant="outline"
          onClick={changeStatusToInTreatment}
          disabled={
            selectedClientCount === 0 || loading || allSelectedAreInTreatment
          }
          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950 bg-transparent disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Qayta davolashga ({selectedClientCount})
        </Button>

        <Button
          variant="outline"
          onClick={deleteClients}
          disabled={selectedClientCount === 0 || loading}
          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950 bg-transparent"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {t.delete} ({selectedClientCount})
        </Button>
      </div>

      <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
        {t.totalTreated} {totalClientsEver} ta mijoz
      </div>
    </div>
  );
};

export default DashboardFooterActions;