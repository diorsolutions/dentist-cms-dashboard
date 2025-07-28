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
]

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
]

// Uzbek day names
const uzbekDaysLatin = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"]

const uzbekDaysCyrillic = ["Якшанба", "Душанба", "Сешанба", "Чоршанба", "Пайшанба", "Жума", "Шанба"]

// Short day names for date picker
const uzbekDaysShortLatin = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"]
const uzbekDaysShortCyrillic = ["Як", "Душ", "Сеш", "Чор", "Пай", "Жум", "Шан"]

export const formatDate = (dateString: string, language = "latin"): string => {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return "N/A"
  }
}

export const getTodayForInput = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, "0")
  const day = today.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const formatDateLong = (dateString: string, language = "latin"): string => {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"

    const day = date.getDate()
    const monthIndex = date.getMonth()
    const year = date.getFullYear()

    const months = language === "cyrillic" ? uzbekMonthsCyrillic : uzbekMonthsLatin

    return `${day} ${months[monthIndex]} ${year}`
  } catch (error) {
    console.error("Error formatting long date:", error)
    return "N/A"
  }
}

// Set up Uzbek locale for date inputs
export const setupUzbekLocale = () => {
  // This will be used to configure date picker locale
  return {
    months: uzbekMonthsLatin,
    monthsShort: uzbekMonthsLatin.map((month) => month.slice(0, 3)),
    weekdays: uzbekDaysLatin,
    weekdaysShort: uzbekDaysShortLatin,
    weekdaysMin: uzbekDaysShortLatin.map((day) => day.slice(0, 2)),
    firstDayOfWeek: 1, // Monday
    format: "DD/MM/YYYY",
    dateFormat: "dd/mm/yyyy",
  }
}

// Convert date to input format (YYYY-MM-DD)
export const dateToInputFormat = (dateString: string): string => {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error converting date to input format:", error)
    return ""
  }
}

// Convert input format (YYYY-MM-DD) to display format (DD/MM/YYYY)
export const inputFormatToDisplay = (inputDate: string): string => {
  if (!inputDate) return ""

  try {
    const [year, month, day] = inputDate.split("-")
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Error converting input format to display:", error)
    return ""
  }
}
