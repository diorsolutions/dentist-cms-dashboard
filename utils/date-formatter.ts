import { format, parseISO } from "date-fns";
import { uz } from "date-fns/locale";

const uzbekMonthsLatin = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

const uzbekMonthsCyrillic = [
  "Январ",
  "Феврал",
  "Март",
  "Апрел",
  "Май",
  "Июн",
  "Июл",
  "Август",
  "Сентабр",
  "Октабр",
  "Ноябр",
  "Декабр",
];

// Uzbek day names
const uzbekDaysLatin = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

const uzbekDaysCyrillic = ["Якшанба", "Душанба", "Сешанба", "Чоршанба", "Пайшанба", "Жума", "Шанба"];

// Short day names for date picker
const uzbekDaysShortLatin = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
const uzbekDaysShortCyrillic = ["Як", "Душ", "Сеш", "Чор", "Пай", "Жум", "Шан"];

export const formatDate = (dateString: string | Date | null, language = "latin"): string => {
  console.log("formatDate received:", dateString); // Debug log
  if (!dateString) return "N/A";

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (isNaN(date.getTime())) {
      console.warn("Invalid date object after parseISO for:", dateString); // Debug log for invalid dates
      return "N/A";
    }

    // Use date-fns for formatting with locale
    return format(date, "dd/MM/yyyy", { locale: uz });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export const getTodayForInput = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateLong = (dateString: string, language = "latin"): string => {
  if (!dateString) return "N/A";

  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) return "N/A";

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const months = language === "cyrillic" ? uzbekMonthsCyrillic : uzbekMonthsLatin;

    return `${day} ${months[monthIndex]} ${year}`;
  } catch (error) {
    console.error("Error formatting long date:", error);
    return "N/A";
  }
};

// Function to calculate age from birth date
export const calculateAge = (dateOfBirth: string | Date | null): number | null => {
  if (!dateOfBirth) return null;

  try {
    const birthDate = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return null;
  }
};


// date-fns uzbek locale object for react-day-picker
export { uz as uzbekLocale };

// Convert date to input format (YYYY-MM-DD)
export const dateToInputFormat = (dateString: string | Date): string => {
  if (!dateString) return "";

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (isNaN(date.getTime())) return "";

    return format(date, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error converting date to input format:", error);
    return "";
  }
};

// Convert input format (YYYY-MM-DD) to display format (DD/MM/YYYY)
export const inputFormatToDisplay = (inputDate: string): string => {
  if (!inputDate) return "";

  try {
    const date = parseISO(inputDate);
    if (isNaN(date.getTime())) return "";

    return format(date, "dd/MM/yyyy", { locale: uz });
  } catch (error) {
    console.error("Error converting input format to display:", error);
    return "";
  }
};