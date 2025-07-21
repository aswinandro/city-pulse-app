import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useEvents } from "../../src/hooks/useEvents"
import { useLanguage } from "../../src/hooks/useLanguage"
import { useAuth } from "../../src/providers/AuthProvider"
import type { Event } from "../../src/types/Event"

import SearchBar from "../../src/components/home/SearchBar"
import EventCard from "../../src/components/events/EventCard"
import LanguageToggle from "../../src/components/common/LanguageToggle"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [city, setCity] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const { events, loading, searchEvents, error, loadDefaultEvents, loadMoreEvents } = useEvents()
  const { t, isRTL } = useLanguage()
  const { userProfile, user } = useAuth()
  const router = useRouter()
  const params = useLocalSearchParams()

  useEffect(() => {
    if (!initialLoaded) {
      loadDefaultEvents()
      setInitialLoaded(true)
    }
  }, [initialLoaded])

  useEffect(() => {
    if (typeof params.search === "string") setSearchQuery(params.search)
    if (typeof params.city === "string") setCity(params.city)
  }, [params.search, params.city])

  const handleSearch = useCallback(async () => {
    const trimmedSearch = searchQuery.trim()
    const trimmedCity = city.trim()

    if (params.search !== trimmedSearch || params.city !== trimmedCity) {
      router.setParams({ search: trimmedSearch, city: trimmedCity })
    }

    if (trimmedSearch || trimmedCity) {
      await searchEvents(trimmedSearch, trimmedCity, true)
    } else {
      await loadDefaultEvents()
    }
  }, [searchQuery, city, params.search, params.city])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (searchQuery || city) {
        await searchEvents(searchQuery, city, true)
      } else {
        await loadDefaultEvents()
      }
    } finally {
      setRefreshing(false)
    }
  }, [searchQuery, city])

  const handleLoadMore = useCallback(() => {
    if (!loading) loadMoreEvents(searchQuery, city)
  }, [loading, searchQuery, city])

  const renderFooter = () => {
    if (!loading || events.length === 0) return null
    return (
      <View className="py-4">
        <LoadingSpinner size="small" />
      </View>
    )
  }

  const handleLoadSampleData = () => {
    loadDefaultEvents()
  }

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: event.id, event: JSON.stringify(event) },
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className={`flex-row items-center justify-between px-4 py-3 border-b border-gray-200 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <View
          className={`flex-1 ${isRTL ? "items-end" : "items-start"} justify-center`}
        >
          <Text
            className={`text-xl font-bold text-gray-800 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("cityPulse")}
          </Text>
          {userProfile && (
            <Text
              className={`text-sm text-gray-500 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {`Welcome back, ${userProfile.displayName || user?.email || ""}`}
            </Text>
          )}
        </View>
        <LanguageToggle />
      </View>

      {/* Search */}
      <View className="p-4">
        <SearchBar
          searchQuery={searchQuery}
          city={city}
          onSearchQueryChange={setSearchQuery}
          onCityChange={setCity}
          onSearch={handleSearch}
          loading={loading}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View
          className={`bg-red-100 p-4 rounded-xl mx-4 mb-4 ${
            isRTL ? "items-end" : "items-start"
          }`}
        >
          <Text className={`text-red-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleLoadSampleData}
            className="bg-blue-500 px-4 py-2 rounded-md"
          >
            <Text className="text-white font-medium">{t("loadSampleEvents")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => handleEventPress(item)}
            isRTL={isRTL} // ✅ pass isRTL explicitly
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && !error && events.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-5xl mb-4">🎭</Text>
              <Text
                className={`text-base text-gray-500 mb-4 ${
                  isRTL ? "text-right" : "text-center"
                }`}
              >
                {t("noEventsFound")}
              </Text>
              <TouchableOpacity
                onPress={handleLoadSampleData}
                className="bg-blue-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">{t("loadEvents")}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}
