"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import jsPDF from "jspdf";
import { AlertCircle } from "lucide-react";
import { isPast, parseISO } from "date-fns"; // Import date-fns functions

import { useToast } from "@/hooks/use-toast";
import { translations, type Translations } from "./types/translations";
import {
  formatDate as formatDateOriginal,
  getTodayForInput,
  uzbekLocale, // Import uzbekLocale
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

// Types
interface TreatmentRecord {
  _id?: string;
  id: number;
  date: string;
  treatmentType: string;
  doctor: string;
  cost: number;
  description: string;
  details: string;
  images?: string[];
  visitType?: string;
  notes?: string;
  nextVisitDate?: string | null;
}

interface Client {
  _id?: string;
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string | null; // Can be null if no visits
  nextAppointment: string | null; // Can be null if no future appointments
  status: "inTreatment" | "completed";
  treatment: string;
  notes: string;
  age: number;
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
  dateOfBirth?: string;
}

interface NewClientState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  age: string;
  address: string;
  treatment: string;
  notes: string;
}

interface NewTreatmentState {
  visitType: string; // Changed from 'visit' to 'visitType'
  treatmentType: string; // Changed from 'treatment' to 'treatmentType'
  description: string; // New field
  notes: string; // Notes for current treatment
  nextVisitDate?: Date; // Changed type to Date
  nextVisitNotes: string; // New field
  images: File[] | null;
}

interface FormErrors {
  [key: string]: string;
}

type SortDirection = "asc" | "desc";
type FilterAndSortField = "name" | "phone" | "email" | "lastVisit" | "nextAppointment";

const DentalClinicDashboard = () => {
  const { theme, systemTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"latin" | "cyrillic">("latin");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentFilterAndSortField, setCurrentFilterAndSortField] = useState<FilterAndSortField>("name");
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>("asc");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [expandedTreatment, setExpandedTreatment] = useState<number | null>(null);
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const [newClient, setNewClient] = useState<NewClientState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    age: "",
    address: "",
    treatment: "",
    notes: "",
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [newTreatment, setNewTreatment] = useState<NewTreatmentState>({
    visitType: "",
    treatmentType: "",
    description: "",
    notes: "",
    nextVisitDate: undefined,
    nextVisitNotes: "",
    images: null,
  });

  const [totalClientsEver, setTotalClientsEver] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const clientsPerPage = 30; // Defined as 30 in backend

  const t: Translations = translations[language];
  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadClientTreatments = async (clientId: string) => {
    try {
      const response = await TreatmentService.getClientTreatments(clientId);
      if (response.success) {
        return response.data
          .map((treatment: any) => ({
            id: treatment._id,
            _id: treatment._id,
            date: treatment.treatmentDate
              ? new Date(treatment.treatmentDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            treatmentType: treatment.treatmentType,
            doctor: treatment.doctor,
            cost: treatment.cost || 0,
            description: treatment.description || treatment.visitType || "",
            details: treatment.notes || "",
            images: treatment.images || [],
            visitType: treatment.visitType,
            notes: treatment.notes,
            nextVisitDate: treatment.nextVisitDate
              ? new Date(treatment.nextVisitDate).toISOString().split("T")[0]
              : null,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
      }
      return [];
    } catch (error) {
      console.error("Error loading treatments:", error);
      return [];
    }
  };

  const loadClients = async (page = currentPage, limit = clientsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        status: statusFilter,
        sortBy: currentFilterAndSortField === "name" ? "firstName" : currentFilterAndSortField, // Adjust for backend field names
        sortOrder: currentSortDirection,
      };
      const response = await ClientService.getAllClients(params);

      if (response.success) {
        const transformedClients = await Promise.all(
          response.data.map(async (client: any) => {
            const treatments = await loadClientTreatments(client._id);

            // Determine last visit
            const lastVisit = treatments.length > 0
              ? treatments[0].date // Assuming treatments are sorted by date desc
              : null;

            // Determine next appointment
            const futureTreatments = treatments.filter(
              (t: TreatmentRecord) => t.nextVisitDate && !isPast(parseISO(t.nextVisitDate))
            );
            const nextAppointment = futureTreatments.length > 0
              ? futureTreatments[0].nextVisitDate // Assuming treatments are sorted by date desc
              : null;

            return {
              id: client._id,
              _id: client._id,
              name: `${client.firstName} ${client.lastName}`,
              phone: client.phone,
              email: client.email,
              lastVisit: lastVisit,
              nextAppointment: nextAppointment,
              status: client.status,
              treatment: client.initialTreatment,
              notes: client.notes,
              age: client.age,
              address: client.address,
              treatmentHistory: treatments, // Store full history for modal
              uploadedImages: client.uploadedFiles?.images || [],
              uploadedFiles: client.uploadedFiles || { images: [] },
              images: client.images || [],
              firstName: client.firstName,
              lastName: client.lastName,
            };
          })
        );

        setClients(transformedClients);
        setTotalClientsEver(response.pagination.total);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.current);
      } else {
        setTotalClientsEver(0);
        setClients([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      setTotalClientsEver(0);
      setClients([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [currentPage, searchTerm, statusFilter, currentFilterAndSortField, currentSortDirection, language]); // Reload on filter/sort/page change

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!newClient.firstName.trim()) errors.firstName = t.firstNameRequired;
    if (!newClient.lastName.trim()) errors.lastName = t.lastNameRequired;
    if (!newClient.phone.trim()) {
      errors.phone = t.phoneRequired;
    } else {
      const phoneRegex = /^\+998\d{9}$/;
      if (!phoneRegex.test(newClient.phone.trim())) errors.phone = t.invalidPhone;
    }
    if (newClient.email && newClient.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClient.email.trim())) errors.email = t.invalidEmail;
    }
    if (newClient.age && newClient.age.trim()) {
      const age = Number.parseInt(newClient.age);
      if (isNaN(age) || age < 1 || age > 150) errors.age = t.invalidAge;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("998")) {
      cleaned = "+" + cleaned;
    } else if (!cleaned.startsWith("+998") && cleaned.length > 0) {
      cleaned = "+998" + cleaned;
    }
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    setNewClient((prev) => ({ ...prev, phone: cleaned }));
    if (formErrors.phone && /^\+998\d{9}$/.test(cleaned)) {
      setFormErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  // The filteredAndSortedClients memo now just uses the `clients` state directly
  // because `loadClients` already fetches the filtered, sorted, and paginated data.
  const filteredAndSortedClients = useMemo(() => clients, [clients]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(filteredAndSortedClients.map((client) => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientSelect = (clientId: number, checked: boolean) => {
    if (checked) {
      setSelectedClients((prev) => [...prev, clientId]);
    } else {
      setSelectedClients((prev) => prev.filter((id) => id !== clientId));
    }
  };

  const selectedClientsData = clients.filter((client) => selectedClients.includes(client.id));
  const allSelectedAreCompleted = selectedClientsData.length > 0 && selectedClientsData.every((client) => client.status === "completed");
  const allSelectedAreInTreatment = selectedClientsData.length > 0 && selectedClientsData.every((client) => client.status === "inTreatment");

  const generatePDF = async () => {
    const selectedClientData = clients.filter((client) => selectedClients.includes(client.id));
    const clientsWithTreatments = await Promise.all(
      selectedClientData.map(async (client) => {
        if (client._id) {
          const treatments = await loadClientTreatments(client._id);
          return { ...client, treatmentHistory: treatments };
        }
        return client;
      })
    );

    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Mijozlar haqida PDF hujjat", 105, 20, { align: "center" });

    let yPos = 40;
    const startX = 20;
    const tableWidth = 170;
    const rowHeight = 8;
    const colWidths = [15, 50, 35, 25, 30, 15];
    const headers = ["No.", "To'liq Ism", "Telefon", "Yosh", "Holat", "Muolaja"];

    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight, "F");
    doc.setLineWidth(0.5);
    doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let xPos = startX;
    headers.forEach((header, index) => {
      const colWidth = colWidths[index];
      const textX = xPos + colWidth / 2;
      doc.text(header, textX, yPos, { align: "center" });
      if (index < headers.length - 1) {
        doc.line(xPos + colWidth, yPos - rowHeight + 2, xPos + colWidth, yPos + 2);
      }
      xPos += colWidth;
    });
    yPos += rowHeight;

    doc.setFont("helvetica", "normal");
    clientsWithTreatments.forEach((client, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight, "F");
      }
      doc.setLineWidth(0.3);
      doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight);

      const treatmentCount = client.treatmentHistory?.length || 0;
      const rowData = [
        (index + 1).toString(),
        client.name.length > 20 ? client.name.substring(0, 20) + "..." : client.name,
        client.phone,
        client.age.toString(),
        t[client.status],
        treatmentCount.toString(),
      ];

      xPos = startX;
      rowData.forEach((data, colIndex) => {
        const colWidth = colWidths[colIndex];
        const textX = xPos + colWidth / 2;
        doc.text(data, textX, yPos, { align: "center" });
        if (colIndex < rowData.length - 1) {
          doc.line(xPos + colWidth, yPos - rowHeight + 2, xPos + colWidth, yPos + 2);
        }
        xPos += colWidth;
      });
      yPos += rowHeight;
    });
    doc.save("mijoz-malumotlari.pdf");
  };

  const openClientModal = async (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsModalOpen(true);
    setActiveTab("info");
    if (client._id) {
      const treatments = await loadClientTreatments(client._id);
      setSelectedClient((prev) => (prev ? { ...prev, treatmentHistory: treatments } : null));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "inTreatment":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const markAsCompleted = async () => {
    try {
      setLoading(true);
      const selectedClientIds = clients
        .filter((client) => selectedClients.includes(client.id))
        .map((client) => client._id)
        .filter(Boolean);

      if (selectedClientIds.length > 0) {
        await ClientService.bulkUpdateStatus(selectedClientIds as string[], "completed");
        await loadClients();
        toast({
          title: "Muvaffaqiyat",
          description: `${selectedClientIds.length} ta mijoz holati yangilandi`,
        });
      }
      setSelectedClients([]);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Holatni yangilashda xatolik yuz berdi");
      toast({
        title: "Xatolik",
        description: "Holatni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteClients = async () => {
    try {
      setLoading(true);
      const selectedClientIds = clients
        .filter((client) => selectedClients.includes(client.id))
        .map((client) => client._id)
        .filter(Boolean);

      if (selectedClientIds.length > 0) {
        await ClientService.bulkDelete(selectedClientIds as string[]);
        await loadClients();
        toast({
          title: "Muvaffaqiyat",
          description: `${selectedClientIds.length} ta mijoz o'chirildi`,
        });
      }
      setSelectedClients([]);
    } catch (error) {
      console.error("Error deleting clients:", error);
      setError("Mijozlarni o'chirishda xatolik yuz berdi");
      toast({
        title: "Xatolik",
        description: "Mijozlarni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const changeStatusToInTreatment = async () => {
    if (
      window.confirm(
        "Haqiqatan ham tanlangan mijozlarning holatini 'davolanmoqda' ga o'zgartirmoqchimisiz?"
      )
    ) {
      try {
        setLoading(true);
        const selectedClientIds = clients
          .filter((client) => selectedClients.includes(client.id))
          .map((client) => client._id)
          .filter(Boolean);

        if (selectedClientIds.length > 0) {
          await ClientService.bulkUpdateStatus(
            selectedClientIds as string[],
            "inTreatment"
          );
          await loadClients();
          toast({
            title: "Muvaffaqiyat",
            description: `${selectedClientIds.length} ta mijoz holati yangilandi`,
          });
        }
        setSelectedClients([]);
      } catch (error) {
        console.error("Error updating status:", error);
        setError("Holatni yangilashda xatolik yuz berdi");
        toast({
          title: "Xatolik",
          description: "Holatni yangilashda xatolik yuz berdi",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddClient = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const clientData = {
        firstName: newClient.firstName.trim(),
        lastName: newClient.lastName.trim(),
        phone: newClient.phone.trim(),
        email: newClient.email.trim() || undefined,
        age: newClient.age ? Number.parseInt(newClient.age) : undefined,
        address: newClient.address.trim() || undefined,
        initialTreatment: newClient.treatment.trim() || undefined,
        notes: newClient.notes.trim() || undefined,
      };

      Object.keys(clientData).forEach((key) => {
        const typedKey = key as keyof typeof clientData;
        if (clientData[typedKey] === undefined || clientData[typedKey] === "") {
          delete clientData[typedKey];
        }
      });

      const response = await ClientService.createClient(clientData);

      if (response.success) {
        const newClientId = response.data._id;
        if (uploadedImages.length > 0) {
          try {
            await UploadService.uploadClientImages(newClientId, uploadedImages);
            toast({
              title: "Muvaffaqiyat",
              description: `Mijoz va ${uploadedImages.length} ta rasm muvaffaqiyatli qo'shildi`,
            });
          } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            toast({
              title: "Ogohlantirish",
              description: "Mijoz qo'shildi, lekin rasmlar yuklanmadi",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Muvaffaqiyat",
            description: "Mijoz muvaffaqiyatli qo'shildi",
          });
        }
        await loadClients();
        setNewClient({
          firstName: "", lastName: "", phone: "", email: "", age: "", address: "", treatment: "", notes: "",
        });
        setUploadedImages([]);
        setFormErrors({});
        setIsAddClientModalOpen(false);
      } else {
        setError(response.message || "Mijoz qo'shishda xatolik yuz berdi");
        toast({
          title: "Xatolik",
          description: response.message || "Mijoz qo'shishda xatolik yuz berdi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding client:", error);
      setError("Mijoz qo'shishda xatolik yuz berdi");
      toast({
        title: "Xatolik",
        description: "Mijoz qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTreatment = async () => {
    if (!newTreatment.visitType || !newTreatment.treatmentType) {
      toast({
        title: "Xatolik",
        description: "Bugungi tashrif va muolaja turi to'ldirilishi kerak.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const treatmentData = {
        clientId: selectedClient?._id,
        visitType: newTreatment.visitType,
        treatmentType: newTreatment.treatmentType,
        description: newTreatment.description || undefined,
        notes: newTreatment.notes || undefined,
        doctor: "Dr. Karimova", // Default doctor
        cost: 0, // Default cost
        nextVisitDate: newTreatment.nextVisitDate,
        nextVisitNotes: newTreatment.nextVisitNotes || undefined,
      };

      const response = await TreatmentService.createTreatment(treatmentData);

      if (response.success) {
        toast({
          title: "Muvaffaqiyat",
          description: "Yangi muolaja muvaffaqiyatli qo'shildi!",
        });

        if (selectedClient?._id) {
          const updatedTreatments = await loadClientTreatments(selectedClient._id);
          setSelectedClient((prev) => (prev ? { ...prev, treatmentHistory: updatedTreatments } : null));
        }

        setNewTreatment({
          visitType: "", treatmentType: "", description: "", notes: "", nextVisitDate: undefined, nextVisitNotes: "", images: null,
        });
        setIsAddTreatmentModalOpen(false);
      } else {
        toast({
          title: "Xatolik",
          description: response.message || "Muolaja qo'shishda xatolik yuz berdi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding treatment:", error);
      toast({
        title: "Xatolik",
        description: "Muolaja qo'shishda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.notSpecified;
    try {
      return formatDateOriginal(dateString, language);
    } catch (error) {
      console.error("Error formatting date:", error);
      return t.notSpecified;
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader
        t={t}
        language={language}
        setLanguage={setLanguage}
        filteredClientCount={filteredAndSortedClients.length}
        loading={loading}
      />

      <div className="container mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300 animate-in fade-in-50 duration-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-auto p-1 text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
            >
              ×
            </Button>
          </div>
        )}

        <ClientFilters
          t={t}
          currentFilterAndSortField={currentFilterAndSortField}
          setCurrentFilterAndSortField={setCurrentFilterAndSortField}
          currentSortDirection={currentSortDirection}
          setCurrentSortDirection={setCurrentSortDirection}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedClientCount={selectedClients.length}
          generatePDF={generatePDF}
        />

        <ClientTable
          t={t}
          filteredAndSortedClients={filteredAndSortedClients}
          loading={loading}
          selectedClients={selectedClients}
          handleSelectAll={handleSelectAll}
          handleClientSelect={handleClientSelect}
          openClientModal={openClientModal}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />

        {totalPages > 1 && (
          <PaginationControls
            t={t}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        <DashboardFooterActions
          t={t}
          setIsAddClientOpen={setIsAddClientModalOpen}
          markAsCompleted={markAsCompleted}
          changeStatusToInTreatment={changeStatusToInTreatment}
          deleteClients={deleteClients}
          selectedClientCount={selectedClients.length}
          loading={loading}
          allSelectedAreCompleted={allSelectedAreCompleted}
          allSelectedAreInTreatment={allSelectedAreInTreatment}
          totalClientsEver={totalClientsEver}
        />
      </div>

      <ClientDetailsModal
        t={t}
        isModalOpen={isClientDetailsModalOpen}
        setIsModalOpen={setIsClientDetailsModalOpen}
        selectedClient={selectedClient}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expandedTreatment={expandedTreatment}
        setExpandedTreatment={setExpandedTreatment}
        setIsAddTreatmentOpen={setIsAddTreatmentModalOpen}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        setPreviewImage={setPreviewImage}
      />

      <AddClientModal
        t={t}
        isAddClientOpen={isAddClientModalOpen}
        setIsAddClientOpen={setIsAddClientModalOpen}
        newClient={newClient}
        setNewClient={setNewClient}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
        isSubmitting={isSubmitting}
        handleAddClient={handleAddClient}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        handlePhoneChange={handlePhoneChange}
      />

      <AddTreatmentModal
        t={t}
        isAddTreatmentOpen={isAddTreatmentModalOpen}
        setIsAddTreatmentOpen={setIsAddTreatmentModalOpen}
        newTreatment={newTreatment}
        setNewTreatment={setNewTreatment}
        handleAddTreatment={handleAddTreatment}
        loading={loading}
        currentTheme={currentTheme}
        getTodayForInput={getTodayForInput}
      />

      <ImagePreviewModal
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />
    </div>
  );
};

export default DentalClinicDashboard;