"use client";

import { DialogFooter } from "@/components/ui/dialog";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Check,
  Languages,
  ChevronRight,
  RotateCcw,
  Loader2,
  AlertCircle,
  ImageIcon,
  X,
  ZoomIn,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { translations, type Translations } from "./types/translations";
import {
  formatDate as formatDateOriginal,
  getTodayForInput,
  setupUzbekLocale,
} from "./utils/date-formatter";
import ClientService from "./services/clientService";
import TreatmentService from "./services/treatmentService";
import UploadService from "./services/uploadService";

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
  lastVisit: string;
  nextAppointment: string;
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

interface Treatment {
  _id?: string;
  clientId: string;
  type: string;
  description: string;
  date: string;
  cost: string;
  notes: string;
  images?: string[];
}

interface Stats {
  totalClients: number;
  activeClients: number;
  todayAppointments: number;
  monthlyRevenue: number;
}

// Keep only 1 example client
// const initialClients: Client[] = [
//   {
//     id: 1,
//     name: "Ahmadjon Karimov",
//     phone: "+998901234567",
//     email: "ahmad@example.com",
//     lastVisit: "2024-01-15",
//     nextAppointment: "2024-01-22",
//     status: "inTreatment",
//     treatment: "Tish to'ldirish",
//     notes: "Yuqori jag'da 3 ta tish davolash kerak",
//     age: 35,
//     address: "Toshkent, Yunusobod tumani",
//     treatmentHistory: [
//       {
//         id: 1,
//         date: "2024-01-15",
//         treatmentType: "Tish to'ldirish",
//         doctor: "Dr. Karimova",
//         cost: 150000,
//         description: "Yuqori jag'dagi tish to'ldirildi",
//         details:
//           "Karies tozalandi, kompozit material bilan to'ldirildi. Bemor og'riq hissi yo'q deb bildirdi.",
//         images: [],
//       },
//     ],
//   },
// ];

type SortState = "none" | "asc" | "desc";

const DentalClinicDashboard = () => {
  const { theme, setTheme, systemTheme } = useTheme();
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

  // Sorting states
  const [nameSortState, setNameSortState] = useState<SortState>("none");
  const [lastVisitSortState, setLastVisitSortState] =
    useState<SortState>("none");
  const [nextAppointmentSortState, setNextAppointmentSortState] =
    useState<SortState>("none");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [expandedTreatment, setExpandedTreatment] = useState<number | null>(
    null
  );
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
  const [isClientInfoOpen, setIsClientInfoOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Client>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeClients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
  });

  // Add client form state
  const [newClient, setNewClient] = useState({
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
  const [treatmentImages, setTreatmentImages] = useState<File[]>([]);

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Total clients ever treated
  const [totalClientsEver, setTotalClientsEver] = useState(0);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);

  const t: Translations = translations[language];

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);

    // Set up Uzbek locale for date inputs
    const uzbekLocale = setupUzbekLocale();

    // Apply custom styles for date picker
    const style = document.createElement("style");
    style.textContent = `
      /* Custom date picker styles for Uzbek locale */
      input[type="date"]::-webkit-calendar-picker-indicator {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3e%3cpath fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd'/%3e%3c/svg%3e");
        cursor: pointer;
      }
      
      /* Style for date input placeholder */
      input[type="date"]:invalid::-webkit-datetime-edit {
        color: #9ca3af;
      }
      
      input[type="date"]:focus::-webkit-datetime-edit {
        color: inherit;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load clients from database
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClientService.getAllClients();

      if (response.success) {
        // Transform API data to match our interface
        const transformedClients = response.data.map((client: any) => ({
          id: client._id,
          _id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          phone: client.phone,
          email: client.email || "",
          lastVisit: client.updatedAt
            ? new Date(client.updatedAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: client.status,
          treatment: client.initialTreatment || "",
          notes: client.notes || "",
          age: client.age || 0,
          address: client.address || "",
          treatmentHistory: [],
          uploadedImages: client.uploadedFiles?.images || [],
          uploadedFiles: client.uploadedFiles || { images: [] },
          images: client.images || [],
          firstName: client.firstName,
          lastName: client.lastName,
        }));

        // If no clients in database, use the example client
        if (transformedClients.length === 0) {
          setTotalClientsEver(1);
        } else {
          setClients(transformedClients);
          setTotalClientsEver(transformedClients.length);
        }
      } else {
        // Fallback to example client if API fails
        setTotalClientsEver(1);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      // Fallback to example client
      setTotalClientsEver(1);
    } finally {
      setLoading(false);
    }
  };

  const loadTreatments = async () => {
    try {
      const response = await fetch("/api/treatments");
      if (!response.ok) throw new Error("Failed to fetch treatments");
      const data = await response.json();
      setTreatments(data);
    } catch (err) {
      console.error("Failed to load treatments:", err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  // Load client treatments
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
            nextVisitDate: treatment.nextVisitDate
              ? new Date(treatment.nextVisitDate).toISOString().split("T")[0]
              : null,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          ); // Sort by most recent
      }
      return [];
    } catch (error) {
      console.error("Error loading treatments:", error);
      return [];
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!newClient.firstName.trim()) {
      errors.firstName = "Ism majburiy";
    }

    if (!newClient.lastName.trim()) {
      errors.lastName = "Familiya majburiy";
    }

    if (!newClient.phone.trim()) {
      errors.phone = "Telefon raqami majburiy";
    } else {
      const phoneRegex = /^\+998\d{9}$/;
      if (!phoneRegex.test(newClient.phone.trim())) {
        errors.phone = "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
      }
    }

    if (newClient.email && newClient.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClient.email.trim())) {
        errors.email = "Email manzili noto'g'ri formatda";
      }
    }

    if (newClient.age && newClient.age.trim()) {
      const age = Number.parseInt(newClient.age);
      if (isNaN(age) || age < 1 || age > 150) {
        errors.age = "Yosh 1 dan 150 gacha bo'lishi kerak";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset other sorts when one is activated
  const resetOtherSorts = (except: string) => {
    if (except !== "name") setNameSortState("none");
    if (except !== "lastVisit") setLastVisitSortState("none");
    if (except !== "nextAppointment") setNextAppointmentSortState("none");
  };

  const handleNameSort = () => {
    resetOtherSorts("name");
    setNameSortState((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
    );
  };

  const handleLastVisitSort = () => {
    resetOtherSorts("lastVisit");
    setLastVisitSortState((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
    );
  };

  const handleNextAppointmentSort = () => {
    resetOtherSorts("nextAppointment");
    setNextAppointmentSortState((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
    );
  };

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter((client) => {
      const matchesSearch =
        searchTerm === "" ||
        client.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        client.phone.startsWith(searchTerm) ||
        client.email.toLowerCase().startsWith(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (nameSortState !== "none") {
      filtered.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return nameSortState === "asc" ? comparison : -comparison;
      });
    } else if (lastVisitSortState !== "none") {
      filtered.sort((a, b) => {
        const comparison =
          new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
        return lastVisitSortState === "asc" ? comparison : -comparison;
      });
    } else if (nextAppointmentSortState !== "none") {
      filtered.sort((a, b) => {
        const comparison =
          new Date(a.nextAppointment).getTime() -
          new Date(b.nextAppointment).getTime();
        return nextAppointmentSortState === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    clients,
    searchTerm,
    statusFilter,
    nameSortState,
    lastVisitSortState,
    nextAppointmentSortState,
  ]);

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

  // Smart button logic
  const selectedClientsData = clients.filter((client) =>
    selectedClients.includes(client.id)
  );
  const hasInTreatmentSelected = selectedClientsData.some(
    (client) => client.status === "inTreatment"
  );
  const hasCompletedSelected = selectedClientsData.some(
    (client) => client.status === "completed"
  );
  const allSelectedAreCompleted =
    selectedClientsData.length > 0 &&
    selectedClientsData.every((client) => client.status === "completed");
  const allSelectedAreInTreatment =
    selectedClientsData.length > 0 &&
    selectedClientsData.every((client) => client.status === "inTreatment");

  const generatePDF = async () => {
    const selectedClientData = clients.filter((client) =>
      selectedClients.includes(client.id)
    );

    // Treatment history yuklamasak, har bir client uchun alohida yuklash
    const clientsWithTreatments = await Promise.all(
      selectedClientData.map(async (client) => {
        if (client._id) {
          const treatments = await loadClientTreatments(client._id);
          return {
            ...client,
            treatmentHistory: treatments,
          };
        }
        return client;
      })
    );

    const doc = new jsPDF();

    // Set font
    doc.setFont("helvetica");

    // Title
    doc.setFontSize(18);
    doc.text("Mijozlar haqida PDF hujjat", 105, 20, { align: "center" });

    // Table setup
    let yPos = 40;
    const startX = 20;
    const tableWidth = 170;
    const rowHeight = 8;
    const colWidths = [15, 50, 35, 25, 30, 15]; // No, Name, Phone, Age, Status, Treatments

    // Headers
    const headers = [
      "No.",
      "To'liq Ism",
      "Telefon",
      "Yosh",
      "Holat",
      "Muolaja",
    ];

    // Header background
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight, "F");

    // Header borders
    doc.setLineWidth(0.5);
    doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight);

    // Header text (centered)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let xPos = startX;
    headers.forEach((header, index) => {
      const colWidth = colWidths[index];
      const textX = xPos + colWidth / 2; // center of column
      doc.text(header, textX, yPos, { align: "center" });

      // vertical divider
      if (index < headers.length - 1) {
        doc.line(
          xPos + colWidth,
          yPos - rowHeight + 2,
          xPos + colWidth,
          yPos + 2
        );
      }
      xPos += colWidth;
    });

    yPos += rowHeight;

    // Draw table data
    doc.setFont("helvetica", "normal");
    clientsWithTreatments.forEach((client, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight, "F");
      }

      // Row border
      doc.setLineWidth(0.3);
      doc.rect(startX, yPos - rowHeight + 2, tableWidth, rowHeight);

      // Treatment count - to'g'ri hisoblash
      const treatmentCount = client.treatmentHistory?.length || 0;
      console.log(`Client ${client.name}: ${treatmentCount} treatments`); // Debug uchun

      const rowData = [
        (index + 1).toString(),
        client.name.length > 20
          ? client.name.substring(0, 20) + "..."
          : client.name,
        client.phone,
        client.age.toString(),
        t[client.status],
        treatmentCount.toString(), // Bu yerda to'g'ri count
      ];

      // Row data (centered)
      xPos = startX;
      rowData.forEach((data, colIndex) => {
        const colWidth = colWidths[colIndex];
        const textX = xPos + colWidth / 2;
        doc.text(data, textX, yPos, { align: "center" });

        // vertical divider
        if (colIndex < rowData.length - 1) {
          doc.line(
            xPos + colWidth,
            yPos - rowHeight + 2,
            xPos + colWidth,
            yPos + 2
          );
        }
        xPos += colWidth;
      });

      yPos += rowHeight;
    });

    doc.save("mijoz-malumotlari.pdf");
  };

  const openClientModal = async (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
    setActiveTab("info");

    // Load treatments for this client
    if (client._id) {
      const treatments = await loadClientTreatments(client._id);
      setSelectedClient((prev) =>
        prev ? { ...prev, treatmentHistory: treatments } : null
      );
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

  const getSortIcon = (sortState: SortState) => {
    if (sortState === "asc") return "↑";
    if (sortState === "desc") return "↓";
    return "↕";
  };

  const markAsCompleted = async () => {
    try {
      setLoading(true);
      const selectedClientIds = clients
        .filter((client) => selectedClients.includes(client.id))
        .map((client) => client._id)
        .filter(Boolean);

      if (selectedClientIds.length > 0) {
        await ClientService.bulkUpdateStatus(selectedClientIds, "completed");
        await loadClients(); // Reload clients
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

  const handleDeleteClients = async () => {
    try {
      const deletePromises = selectedClients.map((clientId) =>
        fetch(`/api/clients/${clientId}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);

      setClients((prev) =>
        prev.filter((client) => !selectedClients.includes(client.id))
      );
      setSelectedClients([]);
      loadStats();
    } catch (err) {
      setError("Failed to delete clients");
      console.error(err);
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
        await ClientService.bulkDelete(selectedClientIds);
        await loadClients(); // Reload clients
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleImagesChange = (files: File[]) => {
    setUploadedImages(files);
  };

  const handleTreatmentImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setTreatmentImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number, type: "client" | "treatment") => {
    if (type === "client") {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setTreatmentImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddClient = async () => {
    // Validate form first
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

      // Remove undefined values to avoid validation issues
      Object.keys(clientData).forEach((key) => {
        const typedKey = key as keyof typeof clientData;
        if (clientData[typedKey] === undefined || clientData[typedKey] === "") {
          delete clientData[typedKey];
        }
      });

      console.log("Submitting client data:", clientData);

      // Create client first
      const response = await ClientService.createClient(clientData);

      if (response.success) {
        const newClientId = response.data._id;

        // Upload images if any
        if (uploadedImages.length > 0) {
          try {
            const uploadResponse = await UploadService.uploadClientImages(
              newClientId,
              uploadedImages
            );
            if (uploadResponse.success) {
              toast({
                title: "Muvaffaqiyat",
                description: `Mijoz va ${uploadedImages.length} ta rasm muvaffaqiyatli qo'shildi`,
              });
            }
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

        await loadClients(); // Reload clients

        // Reset form
        setNewClient({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          age: "",
          address: "",
          treatment: "",
          notes: "",
        });
        setUploadedImages([]);
        setFormErrors({});
        setIsAddClientOpen(false);
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
      // localeCompare
    } finally {
      // for rendering...
      setIsSubmitting(false);
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
            selectedClientIds,
            "inTreatment"
          );
          await loadClients(); // Reload clients
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

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, "");

    // If it starts with 998, add +
    if (cleaned.startsWith("998")) {
      cleaned = "+" + cleaned;
    }
    // If it doesn't start with +998, add it
    else if (!cleaned.startsWith("+998") && cleaned.length > 0) {
      cleaned = "+998" + cleaned;
    }

    // Limit to +998 + 9 digits
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }

    setNewClient((prev) => ({ ...prev, phone: cleaned }));

    // Clear phone error if valid
    if (formErrors.phone && /^\+998\d{9}$/.test(cleaned)) {
      setFormErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  // Get current theme for proper icon display
  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsOpen(true);
  };

  const SortIcon = ({ field }: { field: keyof Client }) => {
    if (sortField !== field)
      return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const exportToPDF = () => {
    // PDF export functionality will be implemented
    console.log("Exporting to PDF...");
  };

  const [newTreatment, setNewTreatment] = useState({
    visit: "",
    treatment: "",
    notes: "",
    nextVisitDate: "",
    images: null as File[] | null,
  });

  const formatDate = (dateString: string) => {
    try {
      return formatDateOriginal(dateString, language);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Image preview component
  const ImagePreview = ({
    src,
    alt,
    onClick,
  }: {
    src: string;
    alt: string;
    onClick: () => void;
  }) => (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors">
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem("dental_clinic_auth");
    router.push("/login");
  };

  const handleAddTreatment = async () => {
    // Basic validation
    if (!newTreatment.visit || !newTreatment.treatment) {
      toast({
        title: "Xatolik",
        description:
          "Bugungi tashrif va keyingi tashrif uchun reja to'ldirilishi kerak.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare treatment data
      const treatmentData = {
        clientId: selectedClient?._id,
        visitType: newTreatment.visit, // Bugungi tashrif
        treatmentType: newTreatment.treatment, // Keyingi tashrif uchun reja
        description: newTreatment.treatment, // Description sifatida ham ishlatamiz
        notes: newTreatment.notes,
        nextVisitDate: newTreatment.nextVisitDate
          ? new Date(newTreatment.nextVisitDate)
          : undefined,
        nextVisitNotes: newTreatment.notes,
      };
      console.log("Yuboriladigan sana:", newTreatment.nextVisitDate);
      console.log("Date obyekt:", new Date(newTreatment.nextVisitDate));

      // Call the treatment service to create a new treatment
      const response = await TreatmentService.createTreatment(treatmentData);

      if (response.success) {
        toast({
          title: "Muvaffaqiyat",
          description: "Yangi muolaja muvaffaqiyatli qo'shildi!",
        });

        // Refresh treatment history
        if (selectedClient?._id) {
          const updatedTreatments = await loadClientTreatments(
            selectedClient._id
          );
          setSelectedClient((prev) =>
            prev ? { ...prev, treatmentHistory: updatedTreatments } : null
          );
        }

        // Reset the form
        setNewTreatment({
          visit: "",
          treatment: "",
          notes: "",
          nextVisitDate: "",
          images: null,
        });

        setIsAddTreatmentOpen(false);
      } else {
        toast({
          title: "Xatolik",
          description:
            response.message || "Muolaja qo'shishda xatolik yuz berdi.",
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

    console.log("Kirishda:", newTreatment); // Bular chiqmasa — funksiyaga kirilmagan
    console.log("Kiritilgan sana:", newTreatment.nextVisitDate);

    const date = new Date(newTreatment.nextVisitDate);
    console.log("Date object:", date);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Top Navigation */}
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
                {filteredAndSortedClients.length} mijoz
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

      <div className="container mx-auto p-6">
        {/* Error Message */}
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

        {/* Filters */}
        <Card className="mb-6 animate-in fade-in-50 duration-300">
          <CardContent className="p-4">
            <div className="w-full flex items-center gap-4">
              {/* Column Filters */}
              <Button
                variant="outline"
                onClick={handleNameSort}
                className="flex items-center gap-2 bg-transparent"
              >
                {t.name} {getSortIcon(nameSortState)}
              </Button>

              <Button
                variant="outline"
                onClick={handleLastVisitSort}
                className="flex items-center gap-2 bg-transparent"
              >
                {t.lastVisit} {getSortIcon(lastVisitSortState)}
              </Button>

              <Button
                variant="outline"
                onClick={handleNextAppointmentSort}
                className="flex items-center gap-2 bg-transparent"
              >
                {t.nextAppointment} {getSortIcon(nextAppointmentSortState)}
              </Button>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses}</SelectItem>
                  <SelectItem value="inTreatment">{t.inTreatment}</SelectItem>
                  <SelectItem value="completed">{t.completed}</SelectItem>
                </SelectContent>
              </Select>

              {/* Search - moved to end */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* PDF Download */}
              {selectedClients.length > 0 && (
                <Button
                  onClick={generatePDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t.downloadPDF}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card className="animate-in fade-in-50 duration-500">
          <CardContent className="p-0">
            {/* Header - removed ID column */}
            <div className="grid grid-cols-11 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
              <div className="col-span-1">
                {selectedClients.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedClients.length ===
                          filteredAndSortedClients.length &&
                        filteredAndSortedClients.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="font-medium">
                      ({selectedClients.length})
                    </Label>
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <Button
                  variant="ghost"
                  className="h-auto cursor-default p-0 font-medium"
                >
                  {t.name}
                </Button>
              </div>
              <div className="col-span-2">{t.lastVisit}</div>
              <div className="col-span-2">{t.nextAppointment}</div>
              <div className="col-span-2">{t.phone}</div>
              <div className="col-span-1">{t.status}</div>
            </div>

            {/* Client Rows - removed ID column */}
            <div className="divide-y">
              {filteredAndSortedClients.map((client, index) => (
                <div
                  key={client.id}
                  className="grid grid-cols-11 gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 animate-in fade-in-50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => openClientModal(client)}
                >
                  <div
                    className="col-span-1 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) =>
                        handleClientSelect(client.id, checked as boolean)
                      }
                    />
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {client.name}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {formatDate(client.lastVisit)}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {formatDate(client.nextAppointment)}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {client.phone}
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge className={getStatusColor(client.status)}>
                      {t[client.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedClients.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground animate-in fade-in-50 duration-300">
                {t.noClientsFound}
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">
                  Ma'lumotlar yuklanmoqda...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Actions */}
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
                selectedClients.length === 0 ||
                loading ||
                allSelectedAreCompleted
              }
              className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950 bg-transparent disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t.markCompleted} ({selectedClients.length})
            </Button>

            {/* Smart Back to Treatment Button - only enabled for completed clients */}
            <Button
              variant="outline"
              onClick={changeStatusToInTreatment}
              disabled={
                selectedClients.length === 0 ||
                loading ||
                allSelectedAreInTreatment
              }
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950 bg-transparent disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Qayta davolashga ({selectedClients.length})
            </Button>

            <Button
              variant="outline"
              onClick={deleteClients}
              disabled={selectedClients.length === 0 || loading}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950 bg-transparent"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t.delete} ({selectedClients.length})
            </Button>
          </div>

          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            {t.totalTreated} {totalClientsEver} ta mijoz
          </div>
        </div>
      </div>

      {/* Client Details Modal - Improved styling */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader className="pb-6">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {selectedClient?.name}
              </DialogTitle>
            </div>
          </DialogHeader>

          {selectedClient && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 h-101">
                <TabsTrigger
                  value="info"
                  className="transition-all duration-200 text-base py-3"
                >
                  {t.clientInfo}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="transition-all duration-200 text-base py-3"
                >
                  {t.treatmentHistory}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="info"
                className="space-y-6 mt-4 animate-in fade-in-50 duration-300"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.name}
                    </Label>
                    <p className="text-base font-medium text-foreground">
                      {selectedClient.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.age}
                    </Label>
                    <p className="text-base font-medium text-foreground">
                      {selectedClient.age}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.phone}
                    </Label>
                    <p className="text-base font-medium text-foreground">
                      {selectedClient.phone}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.email}
                    </Label>
                    <p className="text-base font-medium text-foreground">
                      {selectedClient.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.address}
                    </Label>
                    <p className="text-base font-medium text-foreground">
                      {selectedClient.address}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.status}
                    </Label>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {t[selectedClient.status]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.treatment}
                  </Label>
                  <p className="text-base font-medium text-foreground">
                    {selectedClient.treatment}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.notes}
                  </Label>
                  <p className="text-base font-medium text-foreground">
                    {selectedClient.notes}
                  </p>
                </div>

                {/* Enhanced Images Gallery Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground">
                    Yuklangan rasmlar
                  </Label>
                  {selectedClient.uploadedFiles?.images &&
                  selectedClient.uploadedFiles.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedClient.uploadedFiles.images.map(
                        (image, index) => (
                          <ImagePreview
                            key={index}
                            src={
                              UploadService.getImageUrl(image) ||
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
                  ) : selectedClient.images &&
                    selectedClient.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedClient.images.map((image, index) => (
                        <ImagePreview
                          key={index}
                          src={
                            UploadService.getImageUrl(image) ||
                            "/placeholder.svg"
                          }
                          alt={`Mijoz rasmi ${index + 1}`}
                          onClick={() =>
                            setPreviewImage(UploadService.getImageUrl(image))
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground text-lg">
                        Rasm yuklanmagan
                      </p>
                      <p className="text-muted-foreground/70 text-sm mt-2">
                        Mijoz qo'shish vaqtida rasm yuklash mumkin
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="history"
                className="space-y-6 mt-4 animate-in fade-in-50 duration-300"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {t.treatmentHistory} (
                    {selectedClient.treatmentHistory.length} ta muolaja)
                  </h3>
                  <Button
                    onClick={() => setIsAddTreatmentOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Yangi muolaja qo'shish
                  </Button>
                </div>

                {selectedClient.treatmentHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.noTreatmentHistory}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedClient.treatmentHistory.map((treatment, index) => (
                      <Collapsible key={treatment.id}>
                        <CollapsibleTrigger
                          className="flex items-center justify-between w-full p-5 border rounded-lg hover:bg-muted/50 transition-all duration-200 animate-in fade-in-50"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() =>
                            setExpandedTreatment(
                              expandedTreatment === treatment.id
                                ? null
                                : treatment.id
                            )
                          }
                        >
                          <div className="flex items-center gap-4">
                            {/* Treatment number */}
                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <div className="text-base font-medium text-foreground">
                                {formatDate(treatment.date)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Oxirgi tashrif
                              </div>
                            </div>
                          </div>
                          {expandedTreatment === treatment.id ? (
                            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-5 w-5 transition-transform duration-200" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-5 pb-5 animate-in fade-in-50 duration-200">
                          <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  Olingan muolaja:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.treatmentType}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  Keyingi tashrif uchun izoh:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.details}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-base">
                                  {t.nextVisitDate}:
                                </span>
                                <div className="text-muted-foreground text-base">
                                  {treatment.nextVisitDate
                                    ? formatDate(treatment.nextVisitDate)
                                    : "Belgilanmagan"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>
                                Yaratilgan: {formatDate(treatment.date)}
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

      {/* Add New Client Modal */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>{t.addNewClientTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName} *</Label>
                <Input
                  id="firstName"
                  value={newClient.firstName}
                  onChange={(e) => {
                    setNewClient((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }));
                    if (formErrors.firstName) {
                      setFormErrors((prev) => ({ ...prev, firstName: "" }));
                    }
                  }}
                  placeholder="Ism"
                  className={formErrors.firstName ? "border-red-500" : ""}
                />
                {formErrors.firstName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">{t.lastName} *</Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) => {
                    setNewClient((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }));
                    if (formErrors.lastName) {
                      setFormErrors((prev) => ({ ...prev, lastName: "" }));
                    }
                  }}
                  placeholder="Familiya"
                  className={formErrors.lastName ? "border-red-500" : ""}
                />
                {formErrors.lastName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.lastName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">{t.phoneNumber} *</Label>
                <Input
                  id="phone"
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+998901234567"
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => {
                    setNewClient((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                    if (formErrors.email) {
                      setFormErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="email@example.com"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="age">{t.clientAge}</Label>
                <Input
                  id="age"
                  type="number"
                  value={newClient.age}
                  onChange={(e) => {
                    setNewClient((prev) => ({ ...prev, age: e.target.value }));
                    if (formErrors.age) {
                      setFormErrors((prev) => ({ ...prev, age: "" }));
                    }
                  }}
                  placeholder="25"
                  min="1"
                  max="150"
                  className={formErrors.age ? "border-red-500" : ""}
                />
                {formErrors.age && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.age}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="address">{t.clientAddress}</Label>
                <Input
                  id="address"
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Manzil"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="treatment">{t.initialTreatment}</Label>
              <Input
                id="treatment"
                value={newClient.treatment}
                onChange={(e) =>
                  setNewClient((prev) => ({
                    ...prev,
                    treatment: e.target.value,
                  }))
                }
                placeholder="Dastlabki muolaja"
              />
            </div>

            <div>
              <Label htmlFor="notes">{t.clientNotes}</Label>
              <Textarea
                id="notes"
                value={newClient.notes}
                onChange={(e) =>
                  setNewClient((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Qo'shimcha izohlar"
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>{t.uploadImage}</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Rasmlarni yuklash uchun bosing yoki shu yerga tashlang
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    PNG, JPG, GIF (maksimal 5MB)
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index, "client")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddClientOpen(false);
                setNewClient({
                  firstName: "",
                  lastName: "",
                  phone: "",
                  email: "",
                  age: "",
                  address: "",
                  treatment: "",
                  notes: "",
                });
                setUploadedImages([]);
                setFormErrors({});
              }}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saqlanmoqda...
                </>
              ) : (
                t.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Treatment Modal */}
      <Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
        <DialogContent className="max-w-2xl animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>Yangi muolaja qo'shish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="visit">Bugungi tashrif *</Label>
              <Input
                id="visit"
                value={newTreatment.visit}
                onChange={(e) =>
                  setNewTreatment((prev) => ({
                    ...prev,
                    visit: e.target.value,
                  }))
                }
                placeholder="Bugun qanday muolaja qilindi?"
              />
            </div>

            <div>
              <Label htmlFor="treatment">Keyingi tashrif uchun reja *</Label>
              <Input
                id="treatment"
                value={newTreatment.treatment}
                onChange={(e) =>
                  setNewTreatment((prev) => ({
                    ...prev,
                    treatment: e.target.value,
                  }))
                }
                placeholder="Keyingi safar nima qilish kerak?"
              />
            </div>

            <div>
              <Label htmlFor="notes">Qo'shimcha izohlar</Label>
              <Textarea
                id="notes"
                value={newTreatment.notes}
                onChange={(e) =>
                  setNewTreatment((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Batafsil izoh..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="nextVisitDate">Keyingi tashrif sanasi</Label>
              <Input
                id="nextVisitDate"
                type="date"
                value={newTreatment.nextVisitDate}
                min={getTodayForInput()}
                lang="uz-UZ"
                onChange={(e) =>
                  setNewTreatment((prev) => ({
                    ...prev,
                    nextVisitDate: e.target.value,
                  }))
                }
                placeholder="dd/mm/yyyy"
                style={{
                  colorScheme: currentTheme === "dark" ? "dark" : "light",
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Faqat bugun va bugundan keyingi sanalarni tanlash mumkin
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTreatmentOpen(false);
                setNewTreatment({
                  visit: "",
                  treatment: "",
                  notes: "",
                  nextVisitDate: "",
                  images: null,
                });
              }}
              disabled={loading}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleAddTreatment}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saqlanmoqda...
                </>
              ) : (
                "Saqlash"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="relative">
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DentalClinicDashboard;
