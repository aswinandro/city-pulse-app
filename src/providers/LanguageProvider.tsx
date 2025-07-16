"use client"

import type { ReactNode } from "react"
import { createContext, useState, useEffect, useCallback, useContext } from "react" // Added useContext
import { I18nManager } from "react-native"
import { useTranslation } from "react-i18next"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type i18n from "../i18n/config" // Import i18n instance

// Export the interface so it can be imported by other files
export interface LanguageContextType {
  readonly language: string
  readonly isRTL: boolean
  readonly toggleLanguage: () => void
  readonly t: typeof i18n.t // Use typeof i18n.t for better type compatibility
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

interface LanguageProviderProps {
  readonly children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language)
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL)

  const loadSavedLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("user-language")
      if (savedLanguage) {
        await changeLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Error loading saved language:", error)
    }
  }, [])

  const changeLanguage = useCallback(
    async (newLanguage: string) => {
      try {
        await i18n.changeLanguage(newLanguage)
        setLanguage(newLanguage)

        const shouldBeRTL = newLanguage === "ar"
        setIsRTL(shouldBeRTL)

        await AsyncStorage.setItem("user-language", newLanguage)
      } catch (error) {
        console.error("Error changing language:", error)
      }
    },
    [i18n],
  )

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === "en" ? "ar" : "en"
    changeLanguage(newLanguage)
  }, [language, changeLanguage])

  useEffect(() => {
    loadSavedLanguage()
  }, [loadSavedLanguage])

  const value: LanguageContextType = {
    language,
    isRTL,
    toggleLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
