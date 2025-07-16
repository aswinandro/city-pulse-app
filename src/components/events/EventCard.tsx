"use client"

import { useState } from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFavorites } from "@/hooks/useFavorites"
import { useLanguage } from "@/hooks/useLanguage"
import type { Event } from "@/types/Event"
import { formatDate } from "@/utils/formatters"

interface EventCardProps {
  readonly event: Event
  readonly onPress: () => void
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const { t } = useLanguage()
  const [imageError, setImageError] = useState(false)

  const isFavorite = favorites.some((fav) => fav.id === event.id)
  const venue = event._embedded?.venues?.[0]

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="relative">
        {event.images && event.images.length > 0 && !imageError ? (
          <Image
            source={{ uri: event.images[0].url }}
            className="w-full h-48 rounded-t-lg"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-48 bg-gray-200 rounded-t-lg justify-center items-center">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}

        <TouchableOpacity
          className="absolute top-3 right-3 bg-white/80 rounded-full p-2"
          onPress={() => toggleFavorite(event)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-2" numberOfLines={2}>
          {event.name}
        </Text>

        {event.dates?.start?.localDate && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2 text-sm">{formatDate(event.dates.start.localDate)}</Text>
          </View>
        )}

        {venue && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2 text-sm" numberOfLines={1}>
              {venue.name}
              {venue.city?.name && `, ${venue.city.name}`}
            </Text>
          </View>
        )}

        {event.classifications && event.classifications.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {event.classifications.slice(0, 2).map((classification, index) => (
              <View key={index} className="bg-blue-100 px-2 py-1 rounded-full mr-2 mb-1">
                <Text className="text-blue-800 text-xs">
                  {classification.segment?.name || classification.genre?.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
