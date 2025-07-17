import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Localization from "expo-localization"

import en from "./locales/en.json"
import ar from "./locales/ar.json"

const LANGUAGE_DETECTOR = {
  type: "languageDetector" as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem("user-language")
      if (savedLanguage) {
        callback(savedLanguage)
      } else {
        // Use Localization.getLocales() instead of Localization.locale
        const locales = Localization.getLocales()
        const deviceLanguage = locales.length > 0 ? locales[0].languageCode : "en" // Get languageCode from the first locale
        callback(deviceLanguage)
      }
    } catch (error) {
      callback("en")
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem("user-language", language)
    } catch (error) {
      console.error("Error saving language:", error)
    }
  },
}

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    debug: false,
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
