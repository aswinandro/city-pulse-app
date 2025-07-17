"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { Link } from "expo-router"
import { useAuth } from "../../src/providers/AuthProvider" // Corrected import path
import { useLanguage } from "../../src/hooks/useLanguage" // Corrected import path
import LoadingSpinner from "../../src/components/common/LoadingSpinner"

export default function SignUpScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { t, isRTL } = useLanguage()

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
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className={`flex-1 bg-white px-6 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 mb-2">{t("createAccount")}</Text>
        <Text className="text-gray-600">{t("signUpToContinue")}</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-2">{t("fullName")}</Text>
          <TextInput
            className={`border border-gray-300 rounded-lg px-4 py-3 text-base ${isRTL ? "text-right" : "text-left"}`}
            placeholder={t("enterFullName")}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2">{t("email")}</Text>
          <TextInput
            className={`border border-gray-300 rounded-lg px-4 py-3 text-base ${isRTL ? "text-right" : "text-left"}`}
            placeholder={t("enterEmail")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2">{t("password")}</Text>
          <TextInput
            className={`border border-gray-300 rounded-lg px-4 py-3 text-base ${isRTL ? "text-right" : "text-left"}`}
            placeholder={t("enterPassword")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2">{t("confirmPassword")}</Text>
          <TextInput
            className={`border border-gray-300 rounded-lg px-4 py-3 text-base ${isRTL ? "text-right" : "text-left"}`}
            placeholder={t("enterConfirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className={`bg-blue-600 rounded-lg py-4 mt-6 ${loading ? "opacity-50" : ""}`}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner color="white" size="small" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">{t("createAccount")}</Text>
          )}
        </TouchableOpacity>

        <Link href="/auth" asChild>
          <TouchableOpacity className="mt-6">
            <Text className="text-center text-gray-600">
              {t("alreadyHaveAccount")}
              <Text className="text-blue-600 font-semibold"> {t("signIn")}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
