import { format, parseISO } from "date-fns";
import { uz as uzbekLocale } from "date-fns/locale"; // Renamed 'uz' to 'uzbekLocale' for clarity

export const formatDate = (
  dateString: string | Date | null,
  language = "latin"
): string => {
  if (!dateString) return "N/A";

  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (isNaN(date.getTime())) {
      console.warn("Invalid date object after parseISO for:", dateString);
      return "N/A";
    }

    // Use date-fns for formatting with locale to "dd-MMMM, yyyy"
    return format(date, "dd-MMMM, yyyy", { locale: uzbekLocale });
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

export const formatDateLong = (
  dateString: string,
  language = "latin"
): string => {
  if (!dateString) return "N/A";

  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) return "N/A";

    // Use date-fns for formatting with locale to "dd-MMMM, yyyy"
    return format(date, "dd-MMMM, yyyy", { locale: uzbekLocale });
  } catch (error) {
    console.error("Error formatting long date:", error);
    return "N/A";
  }
};

// Function to calculate age from birth date
export const calculateAge = (
  dateOfBirth: string | Date | null
): number | null => {
  if (!dateOfBirth) return null;

  try {
    const birthDate =
      typeof dateOfBirth === "string" ? parseISO(dateOfBirth) : dateOfBirth;
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
export { uzbekLocale };

// Convert date to input format (YYYY-MM-DD)
export const dateToInputFormat = (dateString: string | Date): string => {
  if (!dateString) return "";

  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (isNaN(date.getTime())) return "";

    return format(date, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error converting date to input format:", error);
    return "";
  }
};

// Convert input format (YYYY-MM-DD) to display format (DD-MMMM, YYYY)
export const inputFormatToDisplay = (inputDate: string): string => {
  if (!inputDate) return "";

  try {
    const date = parseISO(inputDate);
    if (isNaN(date.getTime())) return "";

    return format(date, "dd-MMMM, yyyy", { locale: uzbekLocale });
  } catch (error) {
    console.error("Error converting input format to display:", error);
    return "";
  }
};