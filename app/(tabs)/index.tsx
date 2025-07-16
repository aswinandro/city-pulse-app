"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import SearchBar from "@/components/home/SearchBar"
import EventCard from "@/components/events/EventCard"
import LanguageToggle from "@/components/common/LanguageToggle"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { useEvents } from "@/hooks/useEvents"
import { useLanguage } from "@/hooks/useLanguage"
import { useAuth } from "@/providers/AuthProvider"
import type { Event } from "@/types/Event"

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [city, setCity] = useState("")
  const { events, loading, searchEvents, error, loadSampleEvents } = useEvents()
  const { t, isRTL } = useLanguage()
  const { userProfile } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const params = useLocalSearchParams()

  useEffect(() => {
    // Handle search params from URL
    if (params.search && typeof params.search === "string") {
      setSearchQuery(params.search)
    }
    if (params.city && typeof params.city === "string") {
      setCity(params.city)
    }

    // Load sample events on first load
    loadSampleEvents()
  }, [params, loadSampleEvents])

  const handleSearch = async () => {
    if (searchQuery.trim() || city.trim()) {
      // Update URL with search params
      router.setParams({ search: searchQuery, city })
      await searchEvents(searchQuery, city)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      if (searchQuery.trim() || city.trim()) {
        await searchEvents(searchQuery, city)
      } else {
        await loadSampleEvents()
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: event.id, event: JSON.stringify(event) },
    })
  }

  const handleLoadSampleData = () => {
    loadSampleEvents()
  }

  return (
    <SafeAreaView className={`flex-1 bg-gray-50 ${isRTL ? "flex-row-reverse" : ""}`}>
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <View>
          <Text className="text-2xl font-bold text-gray-800">{t("cityPulse")}</Text>
          {userProfile && <Text className="text-sm text-gray-500">Welcome back, {userProfile.displayName}</Text>}
        </View>
        <LanguageToggle />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          <SearchBar
            searchQuery={searchQuery}
            city={city}
            onSearchQueryChange={setSearchQuery}
            onCityChange={setCity}
            onSearch={handleSearch}
            loading={loading}
          />

          {loading && !refreshing && (
            <View className="py-8">
              <LoadingSpinner />
            </View>
          )}

          {error && (
            <View className="bg-red-100 p-4 rounded-lg mb-4">
              <Text className="text-red-800 mb-2">{error}</Text>
              <TouchableOpacity
                className="bg-primary-500 px-4 py-2 rounded-lg self-start"
                onPress={handleLoadSampleData}
              >
                <Text className="text-white font-medium">Load Sample Events</Text>
              </TouchableOpacity>
            </View>
          )}

          {events.length > 0 && (
            <View className="mt-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                {t("foundEvents", { count: events.length })}
              </Text>
              {events.map((event) => (
                <EventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />
              ))}
            </View>
          )}

          {!loading && events.length === 0 && !error && (
            <View className="py-12 items-center">
              <Text className="text-6xl mb-4">🎭</Text>
              <Text className="text-gray-500 text-center text-lg mb-4">{t("searchForEvents")}</Text>
              <TouchableOpacity className="bg-primary-500 px-6 py-3 rounded-lg" onPress={handleLoadSampleData}>
                <Text className="text-white font-semibold">View Sample Events</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
