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
import AsyncStorage from "@react-native-async-storage/async-storage"
import "../global.css"

function AppContent() {
  const { user, loading } = useAuth()
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false)
  const [isFirstInstall, setIsFirstInstall] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkFirstInstall() {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched")
      setIsFirstInstall(!hasLaunched)
    }
    checkFirstInstall()
  }, [])

  const handleSplashAnimationComplete = () => {
    setSplashAnimationComplete(true)
  }

  // Show splash if not ready
  if (isFirstInstall === null || !splashAnimationComplete || loading) {
    return <SplashScreen onAnimationComplete={handleSplashAnimationComplete} />
  }

  // If first install, force show login screen regardless of auth state
  if (isFirstInstall) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
      </Stack>
    )
  }

  // Normal flow after first install
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" />
        </>
      ) : (
        <Stack.Screen name="auth" />
      )}
    </Stack>
  )
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await seedInitialData()
        console.log("✅ App Initialized")
      } catch (error) {
        console.error("❌ Initialization Failed:", error)
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
