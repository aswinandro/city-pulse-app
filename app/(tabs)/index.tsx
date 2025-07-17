import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  I18nManager,
  StyleSheet,
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

const isRTL = I18nManager.isRTL

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [city, setCity] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const { events, loading, searchEvents, error, loadDefaultEvents, loadMoreEvents } = useEvents()
  const { t } = useLanguage()
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
      <View style={styles.footer}>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isRTL ? (
          <>
            <LanguageToggle />
            <View style={styles.headingContainer}>
              <Text style={styles.title}>{t("cityPulse")}</Text>
              {userProfile && (
                <Text style={styles.subtitle}>
                  {`Welcome back, ${userProfile.displayName || user?.email || ""}`}
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.headingContainer}>
              <Text style={styles.title}>{t("cityPulse")}</Text>
              {userProfile && (
                <Text style={styles.subtitle}>
                  {`Welcome back, ${userProfile.displayName || user?.email || ""}`}
                </Text>
              )}
            </View>
            <LanguageToggle />
          </>
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          searchQuery={searchQuery}
          city={city}
          onSearchQueryChange={setSearchQuery}
          onCityChange={setCity}
          onSearch={handleSearch}
          loading={loading}
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleLoadSampleData}>
            <Text style={styles.errorButtonText}>{t("loadSampleEvents")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
        contentContainerStyle={styles.flatListContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && !error && events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emoji}>🎭</Text>
              <Text style={styles.emptyText}>{t("noEventsFound")}</Text>
              <TouchableOpacity style={styles.reloadButton} onPress={handleLoadSampleData}>
                <Text style={styles.reloadButtonText}>{t("loadEvents")}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        inverted={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    direction: isRTL ? "rtl" : "ltr",
  },
  header: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headingContainer: {
    alignItems: isRTL ? "flex-end" : "flex-start",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: isRTL ? "right" : "left",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: isRTL ? "right" : "left",
  },
  searchContainer: {
    padding: 16,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  errorText: {
    color: "#991b1b",
    marginBottom: 8,
    textAlign: isRTL ? "right" : "left",
  },
  errorButton: {
    alignSelf: isRTL ? "flex-end" : "flex-start",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    direction: isRTL ? "rtl" : "ltr",
  },
  footer: {
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: isRTL ? "right" : "left",
  },
  reloadButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reloadButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
})
