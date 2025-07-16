"use client"

import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useFavorites } from "@/hooks/useFavorites" // Corrected import path
import { useLanguage } from "@/hooks/useLanguage" // Corrected import path
import EventCard from "@/components/events/EventCard"
import type { Event } from "@/types/Event"

export default function FavoritesScreen() {
  const { favorites } = useFavorites()
  const { t, isRTL } = useLanguage()
  const router = useRouter()

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: event.id, event: JSON.stringify(event) },
    })
  }

  return (
    <SafeAreaView className={`flex-1 bg-gray-50 ${isRTL ? "flex-row-reverse" : ""}`}>
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">{t("favorites")}</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          {favorites.length > 0 ? (
            favorites.map((event) => <EventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />)
          ) : (
            <View className="items-center justify-center py-16">
              <Text className="text-6xl mb-4">💝</Text>
              <Text className="text-xl font-semibold text-gray-800 mb-2">{t("noFavorites")}</Text>
              <Text className="text-gray-600 text-center px-8">{t("addSomeEvents")}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
