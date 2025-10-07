"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import jsPDF from "jspdf";
import { AlertCircle, Loader2 } from "lucide-react";
import { isPast, parseISO } from "date-fns";

import { useToast } from "@/hooks/use-toast";
import { translations, type Translations } from "./types/translations";
import {
  formatDate as formatDateOriginal,
  getTodayForInput,
  uzbekLocale,
  calculateAge, // Import calculateAge
} from "./utils/date-formatter";
import ClientService from "./services/clientService";
import TreatmentService from "./services/treatmentService";
import UploadService from "./services/uploadService";

// Import new components
import DashboardHeader from "@/components/DashboardHeader";
import ClientFilters from "@/components/ClientFilters";
import ClientTable from "@/components/ClientTable";
import DashboardFooterActions from "@/components/DashboardFooterActions";
import ClientDetailsModal from "@/components/ClientDetailsModal";
import AddClientModal from "@/components/AddClientModal";
import AddTreatmentModal from "@/components/AddTreatmentModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import PaginationControls from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
// Removed useDebounce import

// Types
interface TreatmentRecord {
  _id?: string;
  id: string;
  treatmentDate: string;
  visitType: string;
  treatmentType: string;
  doctor: string;
  cost: number;
  description: string;
  notes: string;
  nextVisitDate: string | null;
  nextVisitNotes: string;
  images?: string[];
}

interface Client {
  _id?: string;
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string | null;
  nextAppointment: string | null;
  status: "inTreatment" | "completed";
  treatment: string;
  notes: string;
  age: number | null; // Age can be null if dateOfBirth is not set
  dateOfBirth: string | null; // New field
  address: string;
  treatmentHistory: TreatmentRecord[];
  uploadedImages?: string[];
  firstName?: string;
  lastName?: string;
  initialTreatment?: string;
  uploadedFiles?: {
    images?: string[];
  };
  images?: string[];
  treatmentCount: number;
}

interface NewClientState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth?: Date; // New field
  address: string;
  treatment: string;
  notes: string;
}

interface NewTreatmentState {
  visitType: string;
  description: string;
  nextVisitDate?: Date;
  nextVisitNotes: string;
  images: File[] | null;
}

interface FormErrors {
  [key: string]: string;
}

type SortDirection = "asc" | "desc";
type FilterAndSortField = "name" | "phone" | "email" | "lastVisit" | "nextAppointment" | "dateOfBirth"; // Added dateOfBirth

const DentalClinicDashboard = () => {
  const { theme, systemTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"latin" | "cyrillic">("latin");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // For input field value
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(""); // For actual API calls
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentFilterAndSortField, setCurrentFilterAndSortField] = useState<FilterAndSortField>("name");
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>("asc");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [loadingTreatments, setLoadingTreatments] = useState(false); // New state for treatment loading

  const [newClient, setNewClient] = useState<NewClientState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: undefined, // New field
    address: "",
    treatment: "",
    notes: "",
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [newTreatment, setNewTreatment] = useState<NewTreatmentState>({
    visitType: "",
    description: "",
    nextVisitDate: undefined,
    nextVisitNotes: "",
    images: null,
  });

  const [totalClientsEver, setTotalClientsEver] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const clientsPerPage = 30;

  const t: Translations = translations[language];
  const currentTheme = theme === "system" ? systemTheme : theme;

  // Client-side cache for treatment histories
  const [clientTreatmentsCache, setClientTreatmentsCache] = useState<Map<string, TreatmentRecord[]>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadClientTreatments = async (clientId: string, forceRefresh = false): Promise<TreatmentRecord[]> => {
    if (!forceRefresh && clientTreatmentsCache.has(clientId)) {
      console.log(`Treatments for client ${clientId} found in cache.`);
      return clientTreatmentsCache.get(clientId)!;
    }

    try {
      console.log(`Fetching treatments for client ${clientId} from API.`);
      const response = await TreatmentService.getClientTreatments(clientId);
      if (response.success) {
        const treatments = response.data
          .map((treatment: any) => ({
            id: treatment._id,
            _id: treatment._id,
            treatmentDate: treatment.treatmentDate
              ? new Date(treatment.treatmentDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            visitType: treatment.visitType,
            treatmentType: treatment.treatmentType,
            doctor: treatment.doctor,
            cost: treatment.cost || 0,
            description: treatment.description || "",
            notes: treatment.notes || "",
            nextVisitDate: treatment.nextVisitDate
              ? new Date(treatment.nextVisitDate).toISOString().split("T")[0]
              : null,
            nextVisitNotes: treatment.nextVisitNotes || "",
            images: treatment.images || [],
          }))
          .sort(
            (a: TreatmentRecord, b: TreatmentRecord) =>
              new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
          );

        setClientTreatmentsCache(prev => new Map(prev).set(clientId, treatments));
        return treatments;
      }
      return [];
    } catch (error) {
      console.error("Error loading treatments:", error);
      throw error;
    }
  };

  const loadClients = useCallback(async (page = currentPage, limit = clientsPerPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: String(page),
        limit: String(limit),
        search: appliedSearchTerm, // Use appliedSearchTerm for API calls
        status: statusFilter,
        sortBy: currentFilterAndSortField === "name" ? "firstName" : currentFilterAndSortField,
        sortOrder: currentSortDirection,
        searchField: currentFilterAndUploadService.getImageUrl(image) ||
                              "/placeholder.svg"
                            }
                            alt={`Mijoz rasmi ${index + 1}`}
                            onClick={() =>
                              setPreviewImage(UploadService.getImageUrl(image))
                            }
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
                      <ImageIcon className="w-12 h-12 mx-auto text-white/50 mb-4" />
                      <p className="text-white/50 text-lg">
                        {t.noImagesUploaded}
                      </p>
                      <p className="text-white/70 text-sm mt-2">
                        Mijoz qo'shish vaqtida rasm yuklash mumkin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="history"
              className="space-y-6 mt-4 animate-in fade-in-50 duration-300"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {t.treatmentHistory} ({selectedClient.treatmentHistory.length}{" "}
                  ta muolaja)
                </h3>
                <Button
                  onClick={() => setIsAddTreatmentOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  {t.addTreatment}
                </Button>
              </div>

              {loadingTreatments ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">
                    Muolaja tarixi yuklanmoqda...
                  </p>
                </div>
              ) : selectedClient.treatmentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.noTreatmentHistory}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedClient.treatmentHistory.map((treatment, index) => (
                    <Collapsible
                      key={treatment.id}
                      open={expandedTreatment === treatment.id}
                    >
                      <CollapsibleTrigger
                        className="flex items-center justify-between w-full p-5 border rounded-lg hover:bg-muted/50 transition-all duration-200"
                        onClick={() =>
                          setExpandedTreatment(
                            expandedTreatment === treatment.id
                              ? null
                              : treatment.id
                          )
                        }
                      >
                        <div className="flex items-center gap-4">
                          {/* Treatment number: total_treatments - index */}
                          <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                            {selectedClient.treatmentHistory.length - index}
                          </div>
                          <div className="text-left">
                            <div className="text-base font-medium text-foreground">
                              {formatDate(treatment.treatmentDate)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t.lastVisit}
                            </div>
                          </div>
                        </div>
                        {expandedTreatment === treatment.id ? (
                          <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-5 w-5 transition-transform duration-200" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-5 pb-5 space-y-4 pt-4 border-t">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium text-base">
                                {t.visitTypeLabel}:
                              </span>
                              <div className="text-muted-foreground text-base">
                                {treatment.visitType || t.notSpecified}
                              </div>
                            </div>
                          </div>

                          {treatment.description && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  {t.treatmentDescription}:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.description}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium text-base">
                                {t.nextVisitDate}:
                              </span>
                              <div className="text-muted-foreground text-base">
                                {treatment.nextVisitDate
                                  ? formatDate(treatment.nextVisitDate)
                                  : t.notSpecified}
                              </div>
                            </div>
                          </div>

                          {treatment.nextVisitNotes && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  {t.nextVisitNotesLabel}:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.nextVisitNotes}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>
                              {t.createdOn}:{" "}
                              {formatDate(treatment.treatmentDate)}
                            </span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;