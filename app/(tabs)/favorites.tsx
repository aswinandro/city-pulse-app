"use client"

import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useFavorites } from "../../src/hooks/useFavorites"
import { useLanguage } from "../../src/hooks/useLanguage"
import type { Event } from "../../src/types/Event"
import EventCard from "../../src/components/events/EventCard"

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
    <SafeAreaView className={`flex-1 bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <Text
          className={`text-2xl font-bold text-gray-800 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("favorites")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        <View className="p-4">
          {favorites.length > 0 ? (
            favorites.map((event: Event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))
          ) : (
            <View
              className={`items-center justify-center py-16 ${
                isRTL ? "items-end" : "items-start"
              }`}
            >
              <Text className="text-6xl mb-4">💝</Text>
              <Text
                className={`text-xl font-semibold text-gray-800 mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("noFavorites")}
              </Text>
              <Text
                className={`text-base text-gray-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("addSomeEvents")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
