"use client"

import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"
import { AuthProvider } from "./src/providers/AuthProvider"
import { DataProvider } from "./src/providers/DataProvider"
import { LanguageProvider } from "./src/providers/LanguageProvider"
import i18n from "./src/i18n/config"
import { seedInitialData } from "./src/services/DataSeeder"
import "./global.css"

// Import Expo Router's root component
import { Slot } from "expo-router"

// Polyfill for Intl.PluralRules
// This helps resolve the i18next warning about Intl API compatibility
import "@formatjs/intl-pluralrules/polyfill"
import "@formatjs/intl-pluralrules/locale-data/en" // Add locale data for English
import "@formatjs/intl-pluralrules/locale-data/ar" // Add locale data for Arabic

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await seedInitialData()
        console.log("✅ City Pulse App Initialized with Expo SDK 53 + React Native 0.76.9")
      } catch (error) {
        console.error("❌ App initialization failed:", error)
      }
    }

    initializeApp()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <AuthProvider>
            <DataProvider>
              <StatusBar style="auto" />
              <Slot />
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}
