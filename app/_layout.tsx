"use client"

import { useEffect, useState } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"
import { AuthProvider, useAuth } from "../src/providers/AuthProvider"
import { DataProvider } from "../src/providers/DataProvider"
import { LanguageProvider } from "../src/providers/LanguageProvider"
import i18n from "../src/i18n/config"
import { seedInitialData } from "../src/services/DataSeeder"
import SplashScreen from "../src/screens/SplashScreen"
import "../global.css"

// Main app navigation logic
function AppContent() {
  const { user, loading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    console.log("RootLayout Auth State:", { user: user?.email, loading, splashDone })
  }, [user, loading, splashDone])

  const handleSplashAnimationComplete = () => {
    setSplashDone(true)
  }

  if (!splashDone || loading) {
    return <SplashScreen onAnimationComplete={handleSplashAnimationComplete} />
  }

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? "(tabs)" : "auth"}
    >
      {/* Main app routes */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="event/[id]" />

      {/* Auth screens */}
      <Stack.Screen name="auth/index" />
      <Stack.Screen name="auth/signup" />
    </Stack>
  )
}

// Root layout wrapping all providers
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
              <AppContent />
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}
