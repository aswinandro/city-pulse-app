"use client"

import { View, Text, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/hooks/useAuth" // Corrected import path
import { useLanguage } from "@/hooks/useLanguage" // Corrected import path
import LanguageToggle from "@/components/common/LanguageToggle"

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { t, isRTL } = useLanguage()

  const handleLogout = () => {
    Alert.alert(t("logout"), "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: t("logout"), style: "destructive", onPress: logout },
    ])
  }

  return (
    <SafeAreaView className={`flex-1 bg-gray-50 ${isRTL ? "flex-row-reverse" : ""}`}>
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">{t("profile")}</Text>
      </View>

      <View className="flex-1 p-4">
        <View className="bg-white rounded-xl p-6 items-center mb-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#6B7280" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">{user?.email}</Text>
        </View>

        <View className="bg-white rounded-xl mb-6">
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="language-outline" size={24} color="#6B7280" />
              <Text className="text-gray-800 ml-3 text-base">{t("language")}</Text>
            </View>
            <LanguageToggle />
          </View>
        </View>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 flex-row items-center justify-center border border-red-200"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 ml-2 text-base font-semibold">{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
