import { useState } from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFavorites } from "../../hooks/useFavorites"
import { useLanguage } from "../../hooks/useLanguage"
import type { Event } from "../../types/Event"
import { formatDate } from "../../utils/formatters"

interface EventCardProps {
  readonly event: Event
  readonly onPress: () => void
   readonly isRTL?: boolean 
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const { t, isRTL } = useLanguage()
  const [imageError, setImageError] = useState(false)

  const isFavorite = favorites.some((fav) => fav.id === event.id)
  const venue = event._embedded?.venues?.[0]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-4 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Image */}
      <View className="relative">
        {event.images?.[0]?.url && !imageError ? (
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

        {/* Favorite Icon */}
        <TouchableOpacity
          onPress={() => toggleFavorite(event)}
          className={`absolute top-3 bg-white/90 rounded-full p-2 shadow-sm ${isRTL ? "left-3" : "right-3"}`}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View className={`p-4 ${isRTL ? "rtl" : "ltr"}`}>
        {/* Title */}
        <Text
          numberOfLines={2}
          className={`text-lg font-semibold text-gray-800 mb-3 ${isRTL ? "text-right" : "text-left"}`}
        >
          {event.name}
        </Text>

        {/* Date */}
        {event.dates?.start?.localDate && (
          <View className={`items-center mb-2 flex-row ${isRTL ? "flex-row-reverse" : ""}`}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#6B7280"
              className={isRTL ? "ml-2" : "mr-2"}
            />
            <Text className={`text-sm text-gray-600 ${isRTL ? "text-right" : "text-left"}`}>
              {formatDate(event.dates.start.localDate)}
            </Text>
          </View>
        )}

        {/* Location */}
        {venue && (
          <View className={`items-center mb-3 flex-row ${isRTL ? "flex-row-reverse" : ""}`}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#6B7280"
              className={isRTL ? "ml-2" : "mr-2"}
            />
            <Text
              numberOfLines={1}
              className={`text-sm text-gray-600 flex-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {venue.name}
              {venue.city?.name && `, ${venue.city.name}`}
            </Text>
          </View>
        )}

        {/* Categories */}
        {event.classifications?.length > 0 && (
          <View
            className={`flex-row flex-wrap mt-2 gap-2 ${
              isRTL ? "flex-row-reverse justify-end" : "justify-start"
            }`}
          >
            {event.classifications.slice(0, 2).map((classification, idx) => (
              <View
                key={idx}
                className={`bg-gray-100 px-2 py-1 rounded-full ${
                  isRTL ? "ml-1" : "mr-1"
                }`}
              >
                <Text
                  className={`text-xs text-gray-700 font-medium ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
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
