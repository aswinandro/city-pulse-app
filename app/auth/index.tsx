"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { Link } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../src/providers/AuthProvider"
import { useBiometric } from "../../src/hooks/useBiometric"
import { useLanguage } from "../../src/hooks/useLanguage"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"
import LanguageToggle from "../../src/components/common/LanguageToggle"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const {
    isBiometricAvailable,
    biometricType,
    hasSavedCredentials,
    authenticateWithBiometrics,
    saveBiometricCredentials,
  } = useBiometric()
  const { t, isRTL } = useLanguage()

  // Pre-fill email if biometric credentials are saved
  useEffect(() => {
    const loadSavedEmail = async () => {
      if (hasSavedCredentials) {
        try {
          const savedCreds = await (await import("../../src/services/StorageService")).StorageService.getItem(
            "biometric_credentials",
          )
          if (savedCreds && typeof savedCreds === "object" && "email" in savedCreds) {
            setEmail(savedCreds.email as string)
          }
        } catch (e) {
          console.error("Failed to load saved email for pre-fill:", e)
        }
      }
    }
    loadSavedEmail()
  }, [hasSavedCredentials])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("error"), t("fillAllFields"))
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)

      // Ask user if they want to save credentials for biometric login
      if (isBiometricAvailable && !hasSavedCredentials) {
        Alert.alert("Enable Biometric Login?", "Would you like to enable biometric login for faster access?", [
          { text: "Not Now", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              try {
                await saveBiometricCredentials(email, password)
                Alert.alert("Success", "Biometric login enabled!")
              } catch (error) {
                console.error("Failed to save biometric credentials:", error)
                Alert.alert("Error", "Failed to enable biometric login.")
              }
            },
          },
        ])
      }
      console.log("✅ Login successful, navigation handled by root layout.")
    } catch (error: any) {
      console.error("❌ Login error:", error)
      // Error alert is already shown in the signIn function
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setLoading(true)
    try {
      const credentials = await authenticateWithBiometrics()
      if (credentials) {
        // Use the retrieved credentials to sign in
        await signIn(credentials.email, credentials.password)
        Alert.alert(t("success"), t("biometricLoginSuccess"))
        console.log("✅ Biometric login successful, navigation handled by root layout.")
      } else {
        // Biometric authentication failed or was cancelled
        Alert.alert("Biometric Failed", "Biometric authentication was cancelled or failed.")
      }
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Header with Language Toggle */}
      <View className={`flex-row justify-between items-center p-4 pt-12 ${isRTL ? "flex-row-reverse" : ""}`}>
        <View />
        <LanguageToggle />
      </View>

      <View className="flex-1 px-6 justify-center">
        <View className="mb-8">
          <Text className={`text-3xl font-bold text-gray-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
            {t("welcome")}
          </Text>
          <Text className={`text-gray-600 ${isRTL ? "text-right" : "text-left"}`}>{t("signInToContinue")}</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className={`text-gray-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("email")}</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-4 py-3 text-base ${isRTL ? "text-right" : "text-left"}`}
              placeholder={t("enterEmail")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textAlign={isRTL ? "right" : "left"}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            />
          </View>

          <View>
            <Text className={`text-gray-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("password")}</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-4 py-3 text-base ${isRTL ? "text-right" : "text-left"}`}
              placeholder={t("enterPassword")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textAlign={isRTL ? "right" : "left"}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            />
          </View>

          <TouchableOpacity
            className={`bg-blue-600 rounded-lg py-4 mt-6 ${loading ? "opacity-50" : ""}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner color="white" size="small" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">{t("signIn")}</Text>
            )}
          </TouchableOpacity>

          {isBiometricAvailable && hasSavedCredentials && (
            <TouchableOpacity
              className="border border-blue-600 rounded-lg py-4 mt-4 flex-row justify-center items-center"
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Ionicons name="finger-print" size={24} color="#3B82F6" />
              <Text className="text-blue-600 font-semibold text-lg ml-2">{t("biometricLogin")}</Text>
            </TouchableOpacity>
          )}

          <Link href="/auth/signup" asChild>
            <TouchableOpacity className="mt-6">
              <Text className={`text-center text-gray-600 ${isRTL ? "text-right" : "text-left"}`}>
                {t("dontHaveAccount")}
                <Text className="text-blue-600 font-semibold"> {t("signUp")}</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}
