"use client"

import { TouchableOpacity, Text } from "react-native"
import { useLanguage } from "../../hooks/useLanguage"

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <TouchableOpacity
      className="bg-gray-100 px-3 py-1.5 rounded-full active:bg-gray-200 transition-colors"
      onPress={toggleLanguage}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${language === "en" ? "Arabic" : "English"}`}
    >
      <Text className="text-gray-700 text-sm font-medium">{language === "en" ? "العربية" : "English"}</Text>
    </TouchableOpacity>
  )
}
