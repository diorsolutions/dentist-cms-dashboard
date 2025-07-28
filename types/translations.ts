export interface Translations {
  // Navigation
  dentalManagement: string
  searchPlaceholder: string

  // Language options
  uzbekLatin: string
  uzbekCyrillic: string

  // Filters and sorting
  selectAll: string
  selected: string
  lastVisit: string
  nextAppointment: string
  status: string
  name: string
  phone: string
  allStatuses: string

  // Status values (removed waiting)
  inTreatment: string
  completed: string

  // Actions
  addNewClient: string
  markCompleted: string
  delete: string
  downloadPDF: string

  // Modal tabs
  clientInfo: string
  treatmentHistory: string
  addTreatment: string

  // Client info fields
  age: string
  email: string
  address: string
  treatment: string
  notes: string

  // Treatment history
  visitDate: string
  treatmentType: string
  doctor: string
  cost: string
  description: string
  nextVisitDate: string
  treatmentImages: string
  noImagesUploaded: string

  // Add client form
  addNewClientTitle: string
  firstName: string
  lastName: string
  phoneNumber: string
  emailAddress: string
  clientAge: string
  clientAddress: string
  initialTreatment: string
  clientNotes: string
  uploadFiles: string
  uploadImage: string
  uploadAudio: string
  uploadVideo: string
  save: string
  cancel: string

  // Other
  totalShown: string
  totalTreated: string
  noClientsFound: string
  noTreatmentHistory: string
}

export const translations: Record<string, Translations> = {
  latin: {
    dentalManagement: "Dental Management",
    searchPlaceholder: "Mijoz qidirish...",
    uzbekLatin: "O'zbekcha",
    uzbekCyrillic: "Ўзбекча",
    selectAll: "Barchasini tanlash",
    selected: "tanlangan",
    lastVisit: "Oxirgi tashrif",
    nextAppointment: "Keyingi uchrashv",
    status: "Holat",
    name: "Ism",
    phone: "Telefon",
    allStatuses: "Barcha holatlar",
    inTreatment: "davolanmoqda",
    completed: "tugallangan",
    addNewClient: "Yangi mijoz qo'shish",
    markCompleted: "Tugallangan deb belgilash",
    delete: "O'chirish",
    downloadPDF: "PDF formatda yuklab olish",
    clientInfo: "Mijoz ma'lumotlari",
    treatmentHistory: "Muolaja tarixi",
    addTreatment: "Muolaja qo'shish",
    age: "Yoshi",
    email: "Email",
    address: "Manzil",
    treatment: "Davolash",
    notes: "Izohlar",
    visitDate: "Tashrif sanasi",
    treatmentType: "Muolaja turi",
    doctor: "Shifokor",
    cost: "Narxi",
    description: "Tavsif",
    nextVisitDate: "Keyingi uchrashv sanasi",
    treatmentImages: "Yuklangan muolaja rasmlari",
    noImagesUploaded: "Siz rasm yuklamagansiz",
    addNewClientTitle: "Yangi mijoz qo'shish",
    firstName: "Ism",
    lastName: "Familiya",
    phoneNumber: "Telefon raqam",
    emailAddress: "Email manzil",
    clientAge: "Yosh",
    clientAddress: "Manzil",
    initialTreatment: "Dastlabki muolaja",
    clientNotes: "Izohlar",
    uploadFiles: "Fayllar yuklash",
    uploadImage: "Rasm yuklash",
    uploadAudio: "Audio yuklash",
    uploadVideo: "Video yuklash",
    save: "Saqlash",
    cancel: "Bekor qilish",
    totalShown: "Jami ko'rsatilgan:",
    totalTreated: "Jami davolangan:",
    noClientsFound: "Hech qanday mijoz topilmadi",
    noTreatmentHistory: "Muolaja tarixi mavjud emas",
  },
  cyrillic: {
    dentalManagement: "Дентал Менежмент",
    searchPlaceholder: "Мижоз қидириш...",
    uzbekLatin: "O'zbekcha",
    uzbekCyrillic: "Ўзбекча",
    selectAll: "Барчасини танлаш",
    selected: "танланган",
    lastVisit: "Охирги ташриф",
    nextAppointment: "Кейинги учрашув",
    status: "Ҳолат",
    name: "Исм",
    phone: "Телефон",
    allStatuses: "Барча ҳолатлар",
    inTreatment: "даволанмоқда",
    completed: "тугалланган",
    addNewClient: "Янги мижоз қўшиш",
    markCompleted: "Тугалланган деб белгилаш",
    delete: "Ўчириш",
    downloadPDF: "PDF форматда юклаб олиш",
    clientInfo: "Мижоз маълумотлари",
    treatmentHistory: "Муолажа тарихи",
    addTreatment: "Муолажа қўшиш",
    age: "Ёши",
    email: "Email",
    address: "Манзил",
    treatment: "Даволаш",
    notes: "Изоҳлар",
    visitDate: "Ташриф санаси",
    treatmentType: "Муолажа тури",
    doctor: "Шифокор",
    cost: "Нархи",
    description: "Тавсиф",
    nextVisitDate: "Кейинги учрашув санаси",
    treatmentImages: "Юкланган муолажа расмлари",
    noImagesUploaded: "Сиз расм юкламагансиз",
    addNewClientTitle: "Янги мижоз қўшиш",
    firstName: "Исм",
    lastName: "Фамилия",
    phoneNumber: "Телефон рақам",
    emailAddress: "Email манзил",
    clientAge: "Ёш",
    clientAddress: "Манзил",
    initialTreatment: "Дастлабки муолажа",
    clientNotes: "Изоҳлар",
    uploadFiles: "Файллар юклаш",
    uploadImage: "Расм юклаш",
    uploadAudio: "Аудио юклаш",
    uploadVideo: "Видео юклаш",
    save: "Сақлаш",
    cancel: "Бекор қилиш",
    totalShown: "Жами кўрсатилган:",
    totalTreated: "Жами даволанган:",
    noClientsFound: "Ҳеч қандай мижоз топилмади",
    noTreatmentHistory: "Муолажа тарихи мавжуд эмас",
  },
}
