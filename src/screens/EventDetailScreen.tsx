"use client"

import { useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"
import { useFavorites } from "@/hooks/useFavorites"
import { useLanguage } from "@/hooks/useLanguage"
import type { Event } from "@/types/Event"
import { formatDate, formatPrice } from "@/utils/formatters"

interface EventDetailScreenProps {
  route: {
    params: {
      event: Event
    }
  }
  navigation: any
}

export default function EventDetailScreen({ route, navigation }: EventDetailScreenProps) {
  const { event } = route.params
  const { favorites, toggleFavorite } = useFavorites()
  const { t, isRTL } = useLanguage()
  const [imageError, setImageError] = useState(false)

  const isFavorite = favorites.some((fav) => fav.id === event.id)

  const handleTicketPress = () => {
    if (event.url) {
      Linking.openURL(event.url)
    }
  }

  const venue = event._embedded?.venues?.[0]
  const location = venue?.location

  // Check if location and its properties are valid numbers before rendering MapView
  const isValidLocation =
    location && !isNaN(Number.parseFloat(location.latitude)) && !isNaN(Number.parseFloat(location.longitude))

  return (
    <SafeAreaView className={`flex-1 bg-white ${isRTL ? "rtl" : "ltr"}`}>
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">{t("eventDetails")}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(event)}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {event.images && event.images.length > 0 && !imageError ? (
          <Image
            source={{ uri: event.images[0].url }}
            className="w-full h-64"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-48 bg-gray-200 rounded-t-lg justify-center items-center">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}

        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">{event.name}</Text>

          {event.dates?.start?.localDate && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2">{formatDate(event.dates.start.localDate)}</Text>
            </View>
          )}

          {venue && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {venue.name}
                {venue.city?.name && `, ${venue.city.name}`}
              </Text>
            </View>
          )}

          {event.priceRanges && event.priceRanges.length > 0 && (
            <View className="flex-row items-center mb-4">
              <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {formatPrice(event.priceRanges[0].min, event.priceRanges[0].currency)} -
                {formatPrice(event.priceRanges[0].max, event.priceRanges[0].currency)}
              </Text>
            </View>
          )}

          {event.info && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">{t("description")}</Text>
              <Text className="text-gray-600 leading-6">{event.info}</Text>
            </View>
          )}

          {isValidLocation && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">{t("location")}</Text>
              <View className="h-48 rounded-lg overflow-hidden">
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: Number.parseFloat(location!.latitude), // Use non-null assertion after check
                    longitude: Number.parseFloat(location!.longitude), // Use non-null assertion after check
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: Number.parseFloat(location!.latitude),
                      longitude: Number.parseFloat(location!.longitude),
                    }}
                    title={venue?.name}
                  />
                </MapView>
              </View>
            </View>
          )}

          {event.url && (
            <TouchableOpacity className="bg-blue-600 rounded-lg py-4 mt-4" onPress={handleTicketPress}>
              <Text className="text-white text-center font-semibold text-lg">{t("buyTickets")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
