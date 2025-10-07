export interface Translations {
  // Main navigation and titles
  dentalManagement: string;
  clientInfo: string;
  treatmentHistory: string;

  // Client form fields
  name: string;
  firstName: string;
  lastName: string;
  age: string;
  phone: string;
  phoneNumber: string;
  email: string;
  address: string;
  clientAge: string;
  clientAddress: string;
  clientNotes: string;
  initialTreatment: string;

  // Status and filters
  status: string;
  allStatuses: string;
  inTreatment: string;
  completed: string;
  lastVisit: string;
  nextAppointment: string;
  treatment: string;
  notes: string;

  // Actions
  addNewClient: string;
  addNewClientTitle: string;
  markCompleted: string;
  delete: string;
  save: string;
  cancel: string;
  downloadPDF: string;
  searchPlaceholder: string; // Existing
  searchBy: string; // New
  searchByName: string; // New
  searchByPhone: string; // New
  searchByEmail: "Email"; // New
  searchByLastVisitDate: string; // New
  searchByNextAppointmentDate: string; // New
  filterBy: string; // New
  filterByName: string; // New
  filterByPhone: string; // New
  filterByEmail: "Email"; // New
  filterByLastVisit: string; // New
  filterByNextAppointment: string; // New

  // History and records
  noTreatmentHistory: string;
  noClientsFound: string;
  totalTreated: string;

  // Languages
  uzbekLatin: string;
  uzbekCyrillic: string;
  english: string;

  // Image and upload
  uploadImage: string;
  uploadedImages: string;
  noImagesUploaded: string;

  // Treatment specific
  visitTypeLabel: string; // Renamed from todayVisit
  treatmentCategoryLabel: string; // Renamed from treatmentType
  nextVisitPlan: string;
  nextVisitDate: string;
  additionalNotes: string;
  doctor: string;
  cost: string;
  description: string;
  details: string;
  treatmentDescription: string; // New
  nextVisitNotes: string; // Existing, but ensure it's used correctly

  // Form validation
  required: string;
  invalidPhone: string;
  invalidEmail: string;
  invalidAge: string;
  nameRequired: string;
  firstNameRequired: string;
  lastNameRequired: string;
  phoneRequired: string;
  emailRequired: string;
  ageRequired: string;
  addressRequired: string;
  initialTreatmentRequired: string;
  notesRequired: string;

  // Success messages
  success: string;
  clientAdded: string;
  clientUpdated: string;
  clientDeleted: string;
  treatmentAdded: string;
  statusUpdated: string;

  // Error messages
  error: string;
  loadingError: string;
  submitError: string;

  // Loading states
  loading: string;
  saving: string;
  deleting: string;

  // Modal actions
  addTreatment: string;
  viewDetails: string;
  editClient: string;

  // Statistics
  totalClients: string;
  activeClients: string;
  todayAppointments: string;
  monthlyRevenue: string;

  // Date and time
  today: string;
  yesterday: string;
  tomorrow: string;
  thisWeek: string;
  thisMonth: string;

  // Navigation
  back: string;
  next: string;
  previous: string;
  close: string;

  // Additional features
  exportData: string;
  importData: string;
  settings: string;
  profile: string;
  logout: string;

  // Treatment details
  visitNumber: string;
  treatmentReceived: string;
  nextVisitNotesLabel: string; // New label for next visit notes
  createdOn: string;
  notSpecified: string;

  // Responsive labels
  clients: string;
  treatments: string;
  images: string;
  information: string;
  history: string;
}

export const translations: Record<
  "latin" | "cyrillic" | "english",
  Translations
> = {
  latin: {
    // Main navigation and titles
    dentalManagement: "Stomatologiya boshqaruvi",
    clientInfo: "Mijoz ma'lumotlari",
    treatmentHistory: "Davolash tarixi",

    // Client form fields
    name: "Ism",
    firstName: "Ism",
    lastName: "Familiya",
    age: "Yosh",
    phone: "Telefon",
    phoneNumber: "Telefon raqami",
    email: "Email",
    address: "Manzil",
    clientAge: "Mijoz yoshi",
    clientAddress: "Mijoz manzili",
    clientNotes: "Izohlar",
    initialTreatment: "Dastlabki muolaja",

    // Status and filters
    status: "Holat",
    allStatuses: "Barcha holatlar",
    inTreatment: "Davolanmoqda",
    completed: "Tugallangan",
    lastVisit: "Oxirgi tashrif",
    nextAppointment: "Keyingi uchrashiv",
    treatment: "Muolaja",
    notes: "Izohlar",

    // Actions
    addNewClient: "Yangi mijoz qo'shish",
    addNewClientTitle: "Yangi mijoz qo'shish",
    markCompleted: "Tugallangan deb belgilash",
    delete: "O'chirish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    downloadPDF: "PDF yuklab olish",
    searchPlaceholder: "Mijoz qidirish...",
    searchBy: "Qidirish bo'yicha",
    searchByName: "Ism bo'yicha qidirish...",
    searchByPhone: "Telefon raqami bo'yicha qidirish...",
    searchByEmail: "Email bo'yicha qidirish...",
    searchByLastVisitDate: "Oxirgi tashrif sanasi bo'yicha qidirish (YYYY-MM-DD)...",
    searchByNextAppointmentDate: "Keyingi uchrashuv sanasi bo'yicha qidirish (YYYY-MM-DD)...",
    filterBy: "Qidirish/Saralash bo'yicha",
    filterByName: "Ism",
    filterByPhone: "Telefon",
    filterByEmail: "Email",
    filterByLastVisit: "Oxirgi tashrif",
    filterByNextAppointment: "Keyingi uchrashuv",

    // History and records
    noTreatmentHistory: "Davolash tarixi yo'q",
    noClientsFound: "Mijozlar topilmadi",
    totalTreated: "Jami davolangan:",

    // Languages
    uzbekLatin: "Uz, (Lotin)",
    uzbekCyrillic: "Ўз, (Кирилл)",
    english: "English",

    // Image and upload
    uploadImage: "Rasm yuklash",
    uploadedImages: "Yuklangan rasmlar",
    noImagesUploaded: "Rasm yuklanmagan",

    // Treatment specific
    visitTypeLabel: "Bugungi muolaja turi", // Updated
    treatmentCategoryLabel: "Muolaja kategoriyasi", // Updated
    nextVisitPlan: "Keyingi tashrif uchun reja",
    nextVisitDate: "Keyingi tashrif sanasi",
    additionalNotes: "Qo'shimcha izohlar",
    doctor: "Shifokor",
    cost: "Narx",
    description: "Tavsif",
    details: "Tafsilotlar",
    treatmentDescription: "Muolaja tavsifi", // New
    nextVisitNotes: "Keyingi tashrif uchun izoh", // Existing, but ensure it's used correctly
    nextVisitNotesLabel: "Keyingi tashrif uchun izoh", // New label

    // Form validation
    required: "Majburiy maydon",
    invalidPhone: "Telefon raqami noto'g'ri formatda",
    invalidEmail: "Email manzili noto'g'ri formatda",
    invalidAge: "Yosh 1 dan 150 gacha bo'lishi kerak",
    nameRequired: "Siz ism kiritmagansiz",
    firstNameRequired: "Siz ism kiritmagansiz",
    lastNameRequired: "Siz familiya kiritmagansiz",
    phoneRequired: "Siz telefon raqami kiritmagansiz",
    emailRequired: "Siz email kiritmagansiz",
    ageRequired: "Siz yosh kiritmagansiz",
    addressRequired: "Siz manzil kiritmagansiz",
    initialTreatmentRequired: "Siz dastlabki muolaja kiritmagansiz",
    notesRequired: "Siz izoh kiritmagansiz",

    // Success messages
    success: "Muvaffaqiyat",
    clientAdded: "Mijoz muvaffaqiyatli qo'shildi",
    clientUpdated: "Mijoz ma'lumotlari yangilandi",
    clientDeleted: "Mijoz o'chirildi",
    treatmentAdded: "Muolaja qo'shildi",
    statusUpdated: "Holat yangilandi",

    // Error messages
    error: "Xatolik",
    loadingError: "Ma'lumotlarni yuklashda xatolik",
    submitError: "Yuborishda xatolik yuz berdi",

    // Loading states
    loading: "Yuklanmoqda...",
    saving: "Saqlanmoqda...",
    deleting: "O'chirilmoqda...",

    // Modal actions
    addTreatment: "Muolaja qo'shish",
    viewDetails: "Tafsilotlarni ko'rish",
    editClient: "Mijozni tahrirlash",

    // Statistics
    totalClients: "Jami mijozlar",
    activeClients: "Faol mijozlar",
    todayAppointments: "Bugungi uchrashuvlar",
    monthlyRevenue: "Oylik daromad",

    // Date and time
    today: "Bugun",
    yesterday: "Kecha",
    tomorrow: "Ertaga",
    thisWeek: "Bu hafta",
    thisMonth: "Bu oy",

    // Navigation
    back: "Orqaga",
    next: "Keyingi",
    previous: "Oldingi",
    close: "Yopish",

    // Additional features
    exportData: "Ma'lumotlarni eksport qilish",
    importData: "Ma'lumotlarni import qilish",
    settings: "Sozlamalar",
    profile: "Profil",
    logout: "Chiqish",

    // Treatment details
    visitNumber: "Tashrif raqami",
    treatmentReceived: "Olingan muolaja",
    nextVisitNotesLabel: "Keyingi tashrif uchun izoh",
    createdOn: "Yaratilgan",
    notSpecified: "Belgilanmagan",

    // Responsive labels
    clients: "Mijozlar",
    treatments: "Muolajalar",
    images: "Rasmlar",
    information: "Ma'lumotlar",
    history: "Tarix",
  },

  cyrillic: {
    // Main navigation and titles
    dentalManagement: "Стоматология бошқаруви",
    clientInfo: "Мижоз маълумотлари",
    treatmentHistory: "Даволаш тарихи",

    // Client form fields
    name: "Исм",
    firstName: "Исм",
    lastName: "Фамилия",
    age: "Ёш",
    phone: "Телефон",
    phoneNumber: "Телефон рақами",
    email: "Email",
    address: "Манзил",
    clientAge: "Мижоз ёши",
    clientAddress: "Мижоз манзили",
    initialTreatment: "Дастлабки муолажа",
    clientNotes: "Изоҳлар",

    // Status and filters
    status: "Ҳолат",
    allStatuses: "Барча ҳолатлар",
    inTreatment: "Даволанмоқда",
    completed: "Тугалланган",
    lastVisit: "Охирги ташриф",
    nextAppointment: "Кейинги учрашув",
    treatment: "Муолажа",
    notes: "Изоҳлар",

    // Actions
    addNewClient: "Янги мижоз қўшиш",
    addNewClientTitle: "Янги мижоз қўшиш",
    markCompleted: "Тугалланган деб белгилаш",
    delete: "Ўчириш",
    save: "Сақлаш",
    cancel: "Бекор қилиш",
    downloadPDF: "PDF юклаб олиш",
    searchPlaceholder: "Мижоз қидириш...",
    searchBy: "Қидириш бўйича",
    searchByName: "Исм бўйича қидириш...",
    searchByPhone: "Телефон рақами бўйича қидириш...",
    searchByEmail: "Email бўйича қидириш...",
    searchByLastVisitDate: "Охирги ташриф санаси бўйича қидириш (YYYY-MM-DD)...",
    searchByNextAppointmentDate: "Кейинги учрашув санаси бўйича қидириш (YYYY-MM-DD)...",
    filterBy: "Қидириш/Саралаш бўйича",
    filterByName: "Исм",
    filterByPhone: "Телефон",
    filterByEmail: "Email",
    filterByLastVisit: "Охирги ташриф",
    filterByNextAppointment: "Кейинги учрашув",

    // History and records
    noTreatmentHistory: "Даволаш тарихи йўқ",
    noClientsFound: "Мижозлар топилмади",
    totalTreated: "Жами даволанган:",

    // Languages
    uzbekLatin: "Uz, (Лотин)",
    uzbekCyrillic: "Ўз, (Кирилл)",
    english: "English",

    // Image and upload
    uploadImage: "Расм юклаш",
    uploadedImages: "Юкланган расмлар",
    noImagesUploaded: "Расм юкланмаган",

    // Treatment specific
    visitTypeLabel: "Бугунги муолажа тури", // Updated
    treatmentCategoryLabel: "Муолажа категорияси", // Updated
    nextVisitPlan: "Кейинги ташриф учун режа",
    nextVisitDate: "Кейинги ташриф санаси",
    additionalNotes: "Қўшимча изоҳлар",
    doctor: "Шифокор",
    cost: "Нарх",
    description: "Тавсиф",
    details: "Тафсилотлар",
    treatmentDescription: "Муолажа тавсифи", // New
    nextVisitNotes: "Кейинги ташриф учун изоҳ", // Existing, but ensure it's used correctly
    nextVisitNotesLabel: "Кейинги ташриф учун изоҳ", // New label

    // Form validation
    required: "Мажбурий майдон",
    invalidPhone: "Телефон рақами нотўғри форматда",
    invalidEmail: "Email манзили нотўғри форматда",
    invalidAge: "Ёш 1 дан 150 гача бўлиши керак",
    nameRequired: "Сиз исм киритмагансиз",
    firstNameRequired: "Сиз исм киритмагансиз",
    lastNameRequired: "Сиз фамилия киритмагансиз",
    phoneRequired: "Сиз телефон рақами киритмагансиз",
    emailRequired: "Сиз email киритмагансиз",
    ageRequired: "Сиз ёш киритмагансиз",
    addressRequired: "Сиз манзил киритмагансиз",
    initialTreatmentRequired: "Сиз дастлабки муолажа киритмагансиз",
    notesRequired: "Сиз изоҳ киритмагансиз",

    // Success messages
    success: "Муваффақият",
    clientAdded: "Мижоз муваффақиятли қўшилди",
    clientUpdated: "Мижоз маълумотлари янгиланди",
    clientDeleted: "Мижоз ўчирилди",
    treatmentAdded: "Муолажа қўшилди",
    statusUpdated: "Ҳолат янгиланди",

    // Error messages
    error: "Хатолик",
    loadingError: "Маълумотларни юклашда хатолик",
    submitError: "Юборишда хатолик юз берди",

    // Loading states
    loading: "Юкланмоқда...",
    saving: "Сақланмоқда...",
    deleting: "Ўчирилмоқда...",

    // Modal actions
    addTreatment: "Муолажа қўшиш",
    viewDetails: "Тафсилотларни кўриш",
    editClient: "Мижозни таҳрирлаш",

    // Statistics
    totalClients: "Жами мижозлар",
    activeClients: "Фаол мижозлар",
    todayAppointments: "Бугунги учрашувлар",
    monthlyRevenue: "Ойлик даромад",

    // Date and time
    today: "Бугун",
    yesterday: "Кеча",
    tomorrow: "Эртага",
    thisWeek: "Бу ҳафта",
    thisMonth: "Бу ой",

    // Navigation
    back: "Орқага",
    next: "Кейинги",
    previous: "Олдинги",
    close: "Ёпиш",

    // Additional features
    exportData: "Маълумотларни экспорт қилиш",
    importData: "Маълумотларни импорт қилиш",
    settings: "Созламалар",
    profile: "Профил",
    logout: "Чиқиш",

    // Treatment details
    visitNumber: "Ташриф рақами",
    treatmentReceived: "Олинган муолажа",
    nextVisitNotesLabel: "Кейинги ташриф учун изоҳ",
    createdOn: "Яратилган",
    notSpecified: "Белгиланмаган",

    // Responsive labels
    clients: "Мижозлар",
    treatments: "Муолажалар",
    images: "Расмлар",
    information: "Маълумотлар",
    history: "Тарих",
  },

  english: {
    // Main navigation and titles
    dentalManagement: "Dental Management",
    clientInfo: "Client Information",
    treatmentHistory: "Treatment History",

    // Client form fields
    name: "Name",
    firstName: "First Name",
    lastName: "Last Name",
    age: "Age",
    phone: "Phone",
    phoneNumber: "Phone Number",
    email: "Email",
    address: "Address",
    clientAge: "Client Age",
    clientAddress: "Client Address",
    clientNotes: "Notes",
    initialTreatment: "Initial Treatment",

    // Status and filters
    status: "Status",
    allStatuses: "All Statuses",
    inTreatment: "In Treatment",
    completed: "Completed",
    lastVisit: "Last Visit",
    nextAppointment: "Next Appointment",
    treatment: "Treatment",
    notes: "Notes",

    // Actions
    addNewClient: "Add New Client",
    addNewClientTitle: "Add New Client",
    markCompleted: "Mark as Completed",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    downloadPDF: "Download PDF",
    searchPlaceholder: "Search clients...",
    searchBy: "Search by",
    searchByName: "Search by name...",
    searchByPhone: "Search by phone number...",
    searchByEmail: "Search by email...",
    searchByLastVisitDate: "Search by last visit date (YYYY-MM-DD)...",
    searchByNextAppointmentDate: "Search by next appointment date (YYYY-MM-DD)...",
    filterBy: "Filter/Sort by",
    filterByName: "Name",
    filterByPhone: "Phone",
    filterByEmail: "Email",
    filterByLastVisit: "Last Visit",
    filterByNextAppointment: "Next Appointment",

    // History and records
    noTreatmentHistory: "No treatment history",
    noClientsFound: "No clients found",
    totalTreated: "Total treated:",

    // Languages
    uzbekLatin: "Uzbek (Latin)",
    uzbekCyrillic: "Uzbek (Cyrillic)",
    english: "English",

    // Image and upload
    uploadImage: "Upload Image",
    uploadedImages: "Uploaded Images",
    noImagesUploaded: "No images uploaded",

    // Treatment specific
    visitTypeLabel: "Today's Treatment Type", // Updated
    treatmentCategoryLabel: "Treatment Category", // Updated
    nextVisitPlan: "Next Visit Plan",
    nextVisitDate: "Next Visit Date",
    additionalNotes: "Additional Notes",
    doctor: "Doctor",
    cost: "Cost",
    description: "Description",
    details: "Details",
    treatmentDescription: "Treatment Description", // New
    nextVisitNotes: "Next Visit Notes", // Existing, but ensure it's used correctly
    nextVisitNotesLabel: "Next Visit Notes", // New label

    // Form validation
    required: "Required field",
    invalidPhone: "Invalid phone format",
    invalidEmail: "Invalid email format",
    invalidAge: "Age must be between 1 and 150",
    nameRequired: "You haven't entered name",
    firstNameRequired: "You haven't entered first name",
    lastNameRequired: "You haven't entered last name",
    phoneRequired: "You haven't entered phone number",
    emailRequired: "You haven't entered email",
    ageRequired: "You haven't entered age",
    addressRequired: "You haven't entered address",
    initialTreatmentRequired: "You haven't entered initial treatment",
    notesRequired: "You haven't entered notes",

    // Success messages
    success: "Success",
    clientAdded: "Client added successfully",
    clientUpdated: "Client information updated",
    clientDeleted: "Client deleted",
    treatmentAdded: "Treatment added",
    statusUpdated: "Status updated",

    // Error messages
    error: "Error",
    loadingError: "Error loading data",
    submitError: "Error occurred while submitting",

    // Loading states
    loading: "Loading...",
    saving: "Saving...",
    deleting: "Deleting...",

    // Modal actions
    addTreatment: "Add Treatment",
    viewDetails: "View Details",
    editClient: "Edit Client",

    // Statistics
    totalClients: "Total Clients",
    activeClients: "Active Clients",
    todayAppointments: "Today's Appointments",
    monthlyRevenue: "Monthly Revenue",

    // Date and time
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    thisMonth: "This Month",

    // Navigation
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",

    // Additional features
    exportData: "Export Data",
    importData: "Import Data",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",

    // Treatment details
    visitNumber: "Visit Number",
    treatmentReceived: "Treatment Received",
    nextVisitNotesLabel: "Next Visit Notes",
    createdOn: "Created On",
    notSpecified: "Not Specified",

    // Responsive labels
    clients: "Clients",
    treatments: "Treatments",
    images: "Images",
    information: "Information",
    history: "History",
  },
};