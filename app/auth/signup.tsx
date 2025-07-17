"use client"

import { useState } from "react"
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Alert,
  I18nManager,
} from "react-native"
import { useRouter, Link } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../src/providers/AuthProvider"
import { useLanguage } from "../../src/hooks/useLanguage"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"
import LanguageToggle from "../../src/components/common/LanguageToggle"

export default function SignUpScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const { t, isRTL } = useLanguage()
  const router = useRouter()

  const direction = isRTL ? "rtl" : "ltr"

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
    <View
      className="flex-1 bg-gray-100 px-6 justify-center"
      style={{ direction }}
    >
      {/* Header */}
      <View
        className="pt-12 px-4 flex-row justify-between"
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        <View />
        <LanguageToggle />
      </View>

      {/* Title */}
      <View className={`mb-6 w-full ${isRTL ? "items-end" : "items-start"}`}>
        <Text
          className={`text-3xl font-bold text-gray-900 mb-2 w-full ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("createAccount")}
        </Text>
        <Text
          className={`text-base text-gray-600 w-full ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("signUpToContinue")}
        </Text>
      </View>

      {/* Form Fields */}
      <View className="gap-4">
        {/* Full Name */}
        <View>
          <Text className="text-sm text-gray-700 mb-1">
            {t("fullName")}
          </Text>
          <TextInput
            placeholder={t("enterFullName")}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
            style={{ writingDirection: direction }}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
          />
        </View>

        {/* Email */}
        <View>
          <Text className="text-sm text-gray-700 mb-1">
            {t("email")}
          </Text>
          <TextInput
            placeholder={t("enterEmail")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
            style={{ writingDirection: direction }}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
          />
        </View>

        {/* Password */}
        <View>
          <Text className="text-sm text-gray-700 mb-1">
            {t("password")}
          </Text>
          <TextInput
            placeholder={t("enterPassword")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
            style={{ writingDirection: direction }}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
          />
        </View>

        {/* Confirm Password */}
        <View>
          <Text className="text-sm text-gray-700 mb-1">
            {t("confirmPassword")}
          </Text>
          <TextInput
            placeholder={t("enterConfirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
            style={{ writingDirection: direction }}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="mt-6"
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#d4d4d4", "#a3a3a3"]}
            start={[0, 0]}
            end={[1, 1]}
            className="rounded-xl py-4 items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner color="black" size="small" />
            ) : (
              <Text className="text-black font-semibold text-base">
                {t("createAccount")}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign In Link */}
        <Link href="/auth" asChild>
          <TouchableOpacity
            className={`mt-6 ${isRTL ? "items-end" : "items-start"}`}
          >
            <Text className="text-sm text-gray-700">
              {t("alreadyHaveAccount")}
              <Text className="text-gray-500 font-semibold"> {t("signIn")}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
