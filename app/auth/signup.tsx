"use client"

import { useState } from "react"
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native"
import { useRouter, Link } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../src/providers/AuthProvider"
import { useLanguage } from "../../src/hooks/useLanguage"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"
import LanguageToggle from "../../src/components/common/LanguageToggle"
import { BlurView } from "expo-blur"

export default function SignUpScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const { t, isRTL } = useLanguage()
  const router = useRouter()

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert(t("error"), t("fillAllFields"))
      return
    }

    if (password !== confirmPassword) {
      Alert.alert(t("error"), t("passwordsDoNotMatch"))
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName)
      console.log("✅ Sign up successful")
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-100 justify-center px-6">
      {/* Header */}
      <View
        className={`flex-row justify-between px-2 pt-12 mb-6 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <View />
        <LanguageToggle />
      </View>

      {/* Title */}
      <View className={`mb-8 ${isRTL ? "items-end" : ""}`}>
        <Text
          className={`text-2xl font-bold text-gray-800 mb-1 ${
            isRTL ? "text-right" : ""
          }`}
        >
          {t("createAccount")}
        </Text>
        <Text
          className={`text-base text-gray-500 ${
            isRTL ? "text-right" : ""
          }`}
        >
          {t("signUpToContinue")}
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-4">
        {/* Full Name */}
        <View>
          <Text
            className={`text-base text-gray-700 mb-1 ${
              isRTL ? "text-right" : ""
            }`}
          >
            {t("fullName")}
          </Text>
          <TextInput
            className={`bg-white py-3 px-4 rounded-lg border border-gray-300 text-base ${
              isRTL ? "text-right" : "text-left"
            }`}
            placeholder={t("enterFullName")}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Email */}
        <View>
          <Text
            className={`text-base text-gray-700 mb-1 ${
              isRTL ? "text-right" : ""
            }`}
          >
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
          <Text
            className={`text-base text-gray-700 mb-1 ${
              isRTL ? "text-right" : ""
            }`}
          >
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

        {/* Confirm Password */}
        <View>
          <Text
            className={`text-base text-gray-700 mb-1 ${
              isRTL ? "text-right" : ""
            }`}
          >
            {t("confirmPassword")}
          </Text>
          <TextInput
            className={`bg-white py-3 px-4 rounded-lg border border-gray-300 text-base ${
              isRTL ? "text-right" : "text-left"
            }`}
            placeholder={t("enterConfirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Submit Button */}
        <BlurView intensity={30} tint="light" className="mt-6 rounded-xl overflow-hidden">
          <TouchableOpacity
            className={`rounded-xl overflow-hidden ${
              loading ? "opacity-60" : ""
            }`}
            onPress={handleSignUp}
            disabled={loading}
          >
            <LinearGradient
              colors={["#d4d4d4", "#a3a3a3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-3.5 items-center rounded-xl"
            >
              {loading ? (
                <LoadingSpinner color="black" size="small" />
              ) : (
                <Text className="text-gray-900 font-semibold text-lg">
                  {t("createAccount")}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        {/* Sign In Link */}
        <Link href="/auth" asChild>
          <TouchableOpacity className={`mt-6 ${isRTL ? "items-end" : ""}`}>
            <Text
              className={`text-base text-gray-600 ${
                isRTL ? "text-right" : ""
              }`}
            >
              {t("alreadyHaveAccount")}
              <Text className="text-gray-900 font-bold"> {t("signIn")}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
