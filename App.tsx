"use client"

import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"
import { AuthProvider } from "./src/providers/AuthProvider"
import { DataProvider } from "./src/providers/DataProvider"
import { LanguageProvider } from "./src/providers/LanguageProvider"
import AppNavigator from "./src/navigation/AppNavigator"
import i18n from "./src/i18n/config"
import { seedInitialData } from "./src/services/DataSeeder"
import "./global.css"

export default function App() {
  useEffect(() => {
    seedInitialData()
    console.log("City Pulse App Initialized with Expo SDK 53")
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <AuthProvider>
            <DataProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
              </NavigationContainer>
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}
