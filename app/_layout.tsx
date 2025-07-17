"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"
import { AuthProvider } from "../src/providers/AuthProvider"
import { DataProvider } from "../src/providers/DataProvider"
import { LanguageProvider } from "../src/providers/LanguageProvider"
import i18n from "../src/i18n/config"
import { seedInitialData } from "../src/services/DataSeeder"
import '../global.css'

export default function RootLayout() {
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
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="event/[id]" />
              </Stack>
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}
