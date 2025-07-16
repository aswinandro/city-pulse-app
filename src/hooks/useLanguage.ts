"use client"

import { useContext } from "react"
import { LanguageContext } from "@/providers/LanguageProvider" // Corrected import path

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
