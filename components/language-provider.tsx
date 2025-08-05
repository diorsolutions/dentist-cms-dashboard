"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "uz" | "en" | "ru"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Tarjimalar
const translations = {
  uz: {
    loading: "Yuklanmoqda...",
    welcome: "Xush kelibsiz",
    dashboard: "Boshqaruv paneli",
    patients: "Bemorlar",
    appointments: "Uchrashuvlar",
    settings: "Sozlamalar",
    logout: "Chiqish",
    login: "Kirish",
    // Qo'shimcha tarjimalar qo'shing
  },
  en: {
    loading: "Loading...",
    welcome: "Welcome",
    dashboard: "Dashboard",
    patients: "Patients",
    appointments: "Appointments",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    // Add more translations
  },
  ru: {
    loading: "Загрузка...",
    welcome: "Добро пожаловать",
    dashboard: "Панель управления",
    patients: "Пациенты",
    appointments: "Встречи",
    settings: "Настройки",
    logout: "Выход",
    login: "Вход",
    // Добавьте больше переводов
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz")

  useEffect(() => {
    // localStorage dan tilni yuklash
    const savedLanguage = localStorage.getItem("dental_clinic_language") as Language
    if (savedLanguage && ["uz", "en", "ru"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("dental_clinic_language", newLanguage)

    // HTML lang attributini o'zgartirish
    document.documentElement.lang = newLanguage
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
