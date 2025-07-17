"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../hooks/useAuth" // Corrected import path
import { useBiometric } from "../../hooks/useBiometric" // Corrected import path
import { useLanguage } from "../../hooks/useLanguage" // Corrected import path
import LoadingSpinner from "../../components/common/LoadingSpinner"

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { authenticateWithBiometrics, isBiometricAvailable } = useBiometric()
  const { t, isRTL } = useLanguage()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("error"), t("fillAllFields"))
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometrics()
      if (success) {
        Alert.alert(t("success"), t("biometricLoginSuccess"))
      }
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    }
  }

  return (
    <View className={`flex-1 bg-white px-6 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 mb-2">{t("welcome")}</Text>
        <Text className="text-gray-600">{t("signInToContinue")}</Text>
      </View>

      <View className="space-y-4">
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

        {isBiometricAvailable && (
          <TouchableOpacity
            className="border border-blue-600 rounded-lg py-4 mt-4 flex-row justify-center items-center"
            onPress={handleBiometricLogin}
          >
            <Ionicons name="finger-print" size={24} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold text-lg ml-2">{t("biometricLogin")}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity className="mt-6" onPress={() => navigation.navigate("SignUp")}>
          <Text className="text-center text-gray-600">
            {t("dontHaveAccount")}
            <Text className="text-blue-600 font-semibold"> {t("signUp")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
