"use client"

import { View, TextInput, TouchableOpacity, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLanguage } from "../../hooks/useLanguage"

interface SearchBarProps {
  readonly searchQuery: string
  readonly city: string
  readonly onSearchQueryChange: (query: string) => void
  readonly onCityChange: (city: string) => void
  readonly onSearch: () => void
  readonly loading: boolean
}

export default function SearchBar({
  searchQuery,
  city,
  onSearchQueryChange,
  onCityChange,
  onSearch,
  loading,
}: SearchBarProps) {
  const { t, isRTL } = useLanguage()

  return (
    <View className="mb-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Search Input */}
      <View className="bg-white rounded-lg border border-gray-300 mb-3 shadow-sm">
        <View className={`flex-row items-center px-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B7280"
            style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
          />
          <TextInput
            className="flex-1 py-3 text-base text-gray-800"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={onSearch}
            textAlign={isRTL ? "right" : "left"}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          />
        </View>
      </View>

      {/* City Input */}
      <View className="bg-white rounded-lg border border-gray-300 mb-3 shadow-sm">
        <View className={`flex-row items-center px-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#6B7280"
            style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
          />
          <TextInput
            className="flex-1 py-3 text-base text-gray-800"
            placeholder={t("cityPlaceholder")}
            value={city}
            onChangeText={onCityChange}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={onSearch}
            textAlign={isRTL ? "right" : "left"}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          />
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        className={`bg-blue-600 rounded-lg py-3 items-center justify-center shadow-sm ${loading ? "opacity-50" : ""}`}
        onPress={onSearch}
        disabled={loading}
        activeOpacity={0.8}
      >
        <View className={`flex-row items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          {loading ? (
            <Ionicons name="hourglass-outline" size={20} color="white" />
          ) : (
            <>
              <Ionicons
                name="search"
                size={18}
                color="white"
                style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
              />
              <Text className="text-white text-base font-semibold">{t("search")}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}
