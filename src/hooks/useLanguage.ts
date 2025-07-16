"use client"

import { useContext } from "react"
import { LanguageContext, type LanguageContextType } from "../providers/LanguageProvider" // Import the type

export const useLanguage = (): LanguageContextType => {
  // Explicitly type the return
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
