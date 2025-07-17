"use client"

import { useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"
import { useFavorites } from "../../src/hooks/useFavorites"
import { useLanguage } from "../../src/hooks/useLanguage"
import type { Event } from "../../src/types/Event"
import { formatDate, formatPrice } from "../../src/utils/formatters"

export default function EventDetailScreen() {
  const { event: eventParam } = useLocalSearchParams()
  const event: Event = JSON.parse(eventParam as string)
  const { favorites, toggleFavorite } = useFavorites()
  const { t, isRTL } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

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
    <SafeAreaView className="flex-1 bg-white" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Header */}
      <View
        className={`flex-row items-center justify-between p-4 border-b border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#374151" />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold flex-1 text-center ${isRTL ? "text-right" : "text-left"}`}>
          {t("eventDetails")}
        </Text>
        <TouchableOpacity onPress={() => toggleFavorite(event)}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.images && event.images.length > 0 && !imageError ? (
          <Image
            source={{ uri: event.images[0].url }}
            className="w-full h-64"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-48 bg-gray-200 justify-center items-center">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}

        <View className="p-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {/* Event Title */}
          <Text className={`text-2xl font-bold text-gray-800 mb-4 ${isRTL ? "text-right" : "text-left"}`}>
            {event.name}
          </Text>

          {/* Event Date */}
          {event.dates?.start?.localDate && (
            <View className={`flex-row items-center mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#6B7280"
                style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
              />
              <Text className={`text-gray-600 text-base ${isRTL ? "text-right" : "text-left"}`}>
                {formatDate(event.dates.start.localDate)}
              </Text>
            </View>
          )}

          {/* Venue Information */}
          {venue && (
            <View className={`flex-row items-center mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#6B7280"
                style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
              />
              <Text className={`text-gray-600 text-base flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                {venue.name}
                {venue.city?.name && `, ${venue.city.name}`}
                {venue.state?.name && `, ${venue.state.name}`}
              </Text>
            </View>
          )}

          {/* Price Range */}
          {event.priceRanges && event.priceRanges.length > 0 && (
            <View className={`flex-row items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color="#6B7280"
                style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
              />
              <Text className={`text-gray-600 text-base ${isRTL ? "text-right" : "text-left"}`}>
                {formatPrice(event.priceRanges[0].min, event.priceRanges[0].currency)} -{" "}
                {formatPrice(event.priceRanges[0].max, event.priceRanges[0].currency)}
              </Text>
            </View>
          )}

          {/* Event Description */}
          {event.info && (
            <View className="mb-6">
              <Text className={`text-lg font-semibold text-gray-800 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                {t("description")}
              </Text>
              <Text
                className={`text-gray-600 leading-6 text-base ${isRTL ? "text-right" : "text-left"}`}
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {event.info}
              </Text>
            </View>
          )}

          {/* Event Categories */}
          {event.classifications && event.classifications.length > 0 && (
            <View className="mb-6">
              <Text className={`text-lg font-semibold text-gray-800 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                Categories
              </Text>
              <View className={`flex-row flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                {event.classifications.map((classification, index) => (
                  <View key={index} className={`bg-blue-100 px-3 py-1.5 rounded-full mb-2 ${isRTL ? "ml-2" : "mr-2"}`}>
                    <Text className="text-blue-800 text-sm font-medium">
                      {classification.segment?.name || classification.genre?.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Map Section */}
          {isValidLocation && (
            <View className="mb-6">
              <Text className={`text-lg font-semibold text-gray-800 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                {t("location")}
              </Text>
              <View className="h-48 rounded-lg overflow-hidden border border-gray-200">
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: Number.parseFloat(location!.latitude),
                    longitude: Number.parseFloat(location!.longitude),
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
                    description={venue?.address?.line1}
                  />
                </MapView>
              </View>
              {venue?.address?.line1 && (
                <Text className={`text-gray-600 text-sm mt-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {venue.address.line1}
                </Text>
              )}
            </View>
          )}

          {/* Buy Tickets Button */}
          {event.url && (
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-4 mt-4 shadow-sm"
              onPress={handleTicketPress}
              activeOpacity={0.8}
            >
              <View className={`flex-row items-center justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
                <Ionicons
                  name="ticket-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
                />
                <Text className="text-white text-center font-semibold text-lg">{t("buyTickets")}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
