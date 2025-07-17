"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useEvents } from "../../src/hooks/useEvents"
import { useLanguage } from "../../src/hooks/useLanguage"
import { useAuth } from "../../src/providers/AuthProvider"
import type { Event } from "../../src/types/Event"

// Explicit imports to avoid confusion
import SearchBar from "../../src/components/home/SearchBar"
import EventCard from "../../src/components/events/EventCard"
import LanguageToggle from "../../src/components/common/LanguageToggle"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [city, setCity] = useState("")
  const { events, loading, searchEvents, error, loadDefaultEvents } = useEvents()
  const { t, isRTL } = useLanguage()
  const { userProfile } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false)
  const [hasAppliedParams, setHasAppliedParams] = useState(false)
  const router = useRouter()
  const params = useLocalSearchParams()

  // Load initial events
  useEffect(() => {
    if (!hasLoadedInitial) {
      console.log("🔄 Loading initial events...")
      loadDefaultEvents()
      setHasLoadedInitial(true)
    }
  }, [hasLoadedInitial, loadDefaultEvents])

  // Apply URL params only once
  useEffect(() => {
    if (!hasAppliedParams) {
      if (params.search && typeof params.search === "string") {
        setSearchQuery(params.search)
      }
      if (params.city && typeof params.city === "string") {
        setCity(params.city)
      }
      setHasAppliedParams(true)
    }
  }, [params, hasAppliedParams])

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim() || city.trim()) {
      router.setParams({ search: searchQuery, city })
      await searchEvents(searchQuery, city)
    } else {
      await loadDefaultEvents()
    }
  }, [searchQuery, city, router, searchEvents, loadDefaultEvents])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (searchQuery.trim() || city.trim()) {
        await searchEvents(searchQuery, city)
      } else {
        await loadDefaultEvents()
      }
    } finally {
      setRefreshing(false)
    }
  }, [searchQuery, city, searchEvents, loadDefaultEvents])

  const handleEventPress = useCallback(
    (event: Event) => {
      router.push({
        pathname: "/event/[id]",
        params: { id: event.id, event: JSON.stringify(event) },
      })
    },
    [router],
  )

  const handleLoadSampleData = useCallback(() => {
    loadDefaultEvents()
  }, [loadDefaultEvents])

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Header */}
      <View
        className={`flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <View className={isRTL ? "items-end" : "items-start"}>
          <Text className={`text-2xl font-bold text-gray-800 ${isRTL ? "text-right" : "text-left"}`}>
            {t("cityPulse")}
          </Text>
          {userProfile && (
            <Text className={`text-sm text-gray-500 ${isRTL ? "text-right" : "text-left"}`}>
              Welcome back, {userProfile.displayName}
            </Text>
          )}
        </View>
        <LanguageToggle />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Search Bar Component */}
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
              <Text className={`text-red-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>{error}</Text>
              <TouchableOpacity
                className="bg-primary-500 px-4 py-2 rounded-lg self-start"
                onPress={handleLoadSampleData}
              >
                <Text className="text-white font-medium">Load Sample Events</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Events List */}
          {events.length > 0 && (
            <View className="mt-4">
              <Text className={`text-lg font-semibold text-gray-800 mb-4 ${isRTL ? "text-right" : "text-left"}`}>
                {searchQuery || city ? t("foundEvents", { count: events.length }) : `${events.length} Popular Events`}
              </Text>
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />
              ))}
            </View>
          )}

          {!loading && events.length === 0 && !error && (
            <View className="py-12 items-center">
              <Text className="text-6xl mb-4">🎭</Text>
              <Text className={`text-gray-500 text-center text-lg mb-4 ${isRTL ? "text-right" : "text-left"}`}>
                {t("noEventsFound")}
              </Text>
              <TouchableOpacity className="bg-primary-500 px-6 py-3 rounded-lg" onPress={handleLoadSampleData}>
                <Text className="text-white font-semibold">Load Events</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
