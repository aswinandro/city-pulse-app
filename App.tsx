"use client"

import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"
import { I18nManager } from "react-native"
import * as Updates from "expo-updates"

import { Slot } from "expo-router"

import { AuthProvider } from "./src/providers/AuthProvider"
import { DataProvider } from "./src/providers/DataProvider"
import { LanguageProvider, useLanguage } from "./src/providers/LanguageProvider"
import i18n from "./src/i18n/config"
import { seedInitialData } from "./src/services/DataSeeder"

import "./global.css"

// Polyfills for RTL plural support
import "@formatjs/intl-pluralrules/polyfill"
import "@formatjs/intl-pluralrules/locale-data/en"
import "@formatjs/intl-pluralrules/locale-data/ar"

// ---------- App Content that responds to RTL direction ----------
function AppContent() {
  const { isRTL } = useLanguage()

  useEffect(() => {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(true)
      I18nManager.forceRTL(isRTL)
      if (!__DEV__) {
        Updates.reloadAsync?.()
      }
    }
  }, [isRTL])

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" }}>
      <StatusBar style="auto" />
      <Slot />
    </GestureHandlerRootView>
  )
}

// ---------- Root App with Providers ----------
export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await seedInitialData()
        console.log("✅ City Pulse App Initialized with Expo SDK 53 + React Native 0.79.5")
      } catch (error) {
        console.error("❌ App initialization failed:", error)
      }
    }

    initializeApp()
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </I18nextProvider>
  )
}
