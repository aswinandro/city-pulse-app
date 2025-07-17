"use client"

import { View, Text, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../src/providers/AuthProvider"
import { useLanguage } from "../../src/hooks/useLanguage"
import LanguageToggle from "../../src/components/common/LanguageToggle"

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth()
  const { t, isRTL } = useLanguage()

  const handleLogout = () => {
    Alert.alert(
      t("logout"),
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: t("logout"),
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🔄 User confirmed logout, proceeding...")
              await logout()
              // Navigation will be handled automatically by auth state change in app/index.tsx
            } catch (error) {
              console.error("❌ Logout failed:", error)
              // Error alert is already shown in the logout function
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <View className={`px-4 py-2 bg-white border-b border-gray-200 ${isRTL ? "text-right" : "text-left"}`}>
        <Text className={`text-2xl font-bold text-gray-800 ${isRTL ? "text-right" : "text-left"}`}>{t("profile")}</Text>
      </View>

      <View className="flex-1 p-4">
        <View className="bg-white rounded-xl p-6 items-center mb-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#6B7280" />
          </View>
          <Text className={`text-lg font-semibold text-gray-800 ${isRTL ? "text-right" : "text-left"}`}>
            {userProfile?.displayName || user?.email}
          </Text>
          <Text className={`text-sm text-gray-500 ${isRTL ? "text-right" : "text-left"}`}>{user?.email}</Text>
        </View>

        {/* User Stats */}
        {userProfile && (
          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className={`text-lg font-semibold text-gray-800 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
              Your Activity
            </Text>
            <View className={`flex-row justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">{userProfile.stats.favoriteEvents}</Text>
                <Text className="text-sm text-gray-500">Favorites</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">{userProfile.stats.searchCount}</Text>
                <Text className="text-sm text-gray-500">Searches</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">{userProfile.stats.eventsViewed}</Text>
                <Text className="text-sm text-gray-500">Events Viewed</Text>
              </View>
            </View>
          </View>
        )}

        <View className="bg-white rounded-xl mb-6">
          <View className={`flex-row items-center justify-between p-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <View className={`flex-row items-center ${isRTL ? "flex-row-reverse" : ""}`}>
              <Ionicons name="language-outline" size={24} color="#6B7280" />
              <Text className={`text-gray-800 text-base ${isRTL ? "mr-3 text-right" : "ml-3 text-left"}`}>
                {t("language")}
              </Text>
            </View>
            <LanguageToggle />
          </View>
        </View>

        <TouchableOpacity
          className={`bg-white rounded-xl p-4 flex-row items-center justify-center border border-red-200 ${isRTL ? "flex-row-reverse" : ""}`}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className={`text-red-500 text-base font-semibold ${isRTL ? "mr-2" : "ml-2"}`}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
