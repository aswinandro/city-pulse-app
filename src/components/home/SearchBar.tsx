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
    <View className={`mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
      <View className="flex-row items-center bg-white rounded-lg border border-gray-300 mb-3 px-3 shadow-sm">
        <Ionicons name="search-outline" size={20} color="#6B7280" className="mr-2" />
        <TextInput
          className={`flex-1 py-3 text-base text-gray-800 ${isRTL ? "text-right" : "text-left"}`}
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
      </View>

      <View className="flex-row items-center bg-white rounded-lg border border-gray-300 mb-3 px-3 shadow-sm">
        <Ionicons name="location-outline" size={20} color="#6B7280" className="mr-2" />
        <TextInput
          className={`flex-1 py-3 text-base text-gray-800 ${isRTL ? "text-right" : "text-left"}`}
          placeholder={t("cityPlaceholder")}
          value={city}
          onChangeText={onCityChange}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
      </View>

      <TouchableOpacity
        className={`bg-blue-600 rounded-lg py-3 items-center justify-center shadow-sm ${loading ? "opacity-50" : ""}`}
        onPress={onSearch}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <Ionicons name="hourglass-outline" size={20} color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">{t("search")}</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
