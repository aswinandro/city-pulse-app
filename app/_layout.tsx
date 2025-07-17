"use client"

import { useEffect, useState } from "react" // Import useState
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"
import { AuthProvider, useAuth } from "../src/providers/AuthProvider" // Import useAuth
import { DataProvider } from "../src/providers/DataProvider"
import { LanguageProvider } from "../src/providers/LanguageProvider"
import i18n from "../src/i18n/config"
import { seedInitialData } from "../src/services/DataSeeder"
import SplashScreen from "../src/screens/SplashScreen" // Import the new SplashScreen component
import "../global.css"

// Define a component that wraps the main app logic and uses useAuth
function AppContent() {
  const { user, loading } = useAuth()
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false) // State for splash animation

  // Log the auth state for debugging
  useEffect(() => {
    console.log("RootLayout Auth State:", { user: user?.email, loading, splashAnimationComplete })
  }, [user, loading, splashAnimationComplete])

  // Callback from SplashScreen when its animations are done
  const handleSplashAnimationComplete = () => {
    setSplashAnimationComplete(true)
  }

  // Show splash screen if animations are not complete OR if auth state is still loading
  if (!splashAnimationComplete || loading) {
    return <SplashScreen onAnimationComplete={handleSplashAnimationComplete} />
  }

  // Once splash animations are complete AND auth state is loaded
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // If user is authenticated, show main tabs and event detail screen
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" />
        </>
      ) : (
        // If no user, show authentication screens
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
              <AppContent /> {/* Render AppContent inside providers */}
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}
