"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native"
import { Link } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../src/providers/AuthProvider"
import { useBiometric } from "../../src/hooks/useBiometric"
import { useLanguage } from "../../src/hooks/useLanguage"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"
import LanguageToggle from "../../src/components/common/LanguageToggle"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"

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
    } catch (error: any) {
      console.error("❌ Login error:", error)
      Alert.alert(t("error"), error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setLoading(true)
    try {
      const credentials = await authenticateWithBiometrics()
      if (credentials) {
        await signIn(credentials.email, credentials.password)
        Alert.alert(t("success"), t("biometricLoginSuccess"))
      } else {
        Alert.alert("Biometric Failed", "Biometric authentication was cancelled or failed.")
      }
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center flex-row">
      <View className="w-full max-w-[400px] px-6">
        {/* Language Toggle */}
        <View className="items-end mb-6">
          <LanguageToggle />
        </View>

        {/* Titles */}
        <View className="mb-8">
          <Text className={`text-2xl font-bold text-gray-800 mb-1 ${isRTL ? "text-right" : ""}`}>
            {t("welcome")} 
          </Text>
          <Text className={`text-base text-gray-500 ${isRTL ? "text-right" : ""}`}>
            {t("signInToContinue")} - Production Test
          </Text>
        </View>

        {/* Inputs */}
        <View className="space-y-4">
          {/* Email */}
          <View>
            <Text className={`text-base text-gray-700 mb-1 ${isRTL ? "text-right" : ""}`}>
              {t("email")}
            </Text>
            <TextInput
              className={`bg-white py-3 px-4 rounded-lg border border-gray-300 text-base ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("enterEmail")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign={isRTL ? "right" : "left"}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Password */}
          <View>
            <Text className={`text-base text-gray-700 mb-1 ${isRTL ? "text-right" : ""}`}>
              {t("password")}
            </Text>
            <TextInput
              className={`bg-white py-3 px-4 rounded-lg border border-gray-300 text-base ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("enterPassword")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign={isRTL ? "right" : "left"}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Login Button */}
        <BlurView intensity={30} tint="light" className="mt-6 rounded-xl overflow-hidden">
          <TouchableOpacity
            className={`rounded-xl overflow-hidden ${loading ? "opacity-60" : ""}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#d4d4d4", "#a3a3a3", "#737373"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-3.5 items-center rounded-xl"
            >
              {loading ? (
                <LoadingSpinner color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-lg">{t("signIn")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        {/* Biometric Button */}
        {isBiometricAvailable && hasSavedCredentials && (
          <TouchableOpacity
            className="flex-row justify-center items-center mt-5 py-2.5 border border-gray-400 rounded-lg space-x-2"
            onPress={handleBiometricLogin}
            disabled={loading}
          >
            <Ionicons name="finger-print" size={22} color="#52525b" />
            <Text className="text-gray-600 text-base font-medium">{t("biometricLogin")}</Text>
          </TouchableOpacity>
        )}

        {/* Signup Link */}
        <Link href="/auth/signup" asChild>
          <TouchableOpacity>
            <Text className={`text-base text-gray-600 text-center mt-6 ${isRTL ? "text-right" : ""}`}>
              {t("dontHaveAccount")}
              <Text className="text-gray-900 font-bold"> {t("signUp")}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
