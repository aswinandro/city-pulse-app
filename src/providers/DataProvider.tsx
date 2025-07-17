"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import { Alert } from "react-native"
import { StorageService } from "../services/StorageService"
import { searchEventsAPI } from "../services/ticketmaster"
import { getSampleEvents } from "../services/DataSeeder"
import { useAuth } from "../providers/AuthProvider"
import type { Event } from "../types/Event"

interface DataContextType {
  readonly events: readonly Event[]
  readonly loading: boolean
  readonly error: string | null
  readonly searchEvents: (keyword: string, city: string) => Promise<void>
  readonly clearEvents: () => void
  readonly favorites: readonly Event[]
  readonly toggleFavorite: (event: Event) => Promise<void>
  readonly isFavorite: (eventId: string) => boolean
  readonly searchHistory: readonly string[]
  readonly addToSearchHistory: (term: string) => Promise<void>
  readonly loadSampleEvents: () => Promise<void>
  readonly loadDefaultEvents: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = (): DataContextType => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

interface DataProviderProps {
  readonly children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [events, setEvents] = useState<readonly Event[]>([])
  const [favorites, setFavorites] = useState<readonly Event[]>([])
  const [searchHistory, setSearchHistory] = useState<readonly string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.uid, [user?.uid])

  const loadUserData = useCallback(async () => {
    if (!userId) return

    try {
      const [userFavorites, userSearchHistory] = await Promise.all([
        StorageService.getFavorites<Event>(userId),
        StorageService.getSearchHistory(userId),
      ])

      setFavorites(userFavorites)
      setSearchHistory(userSearchHistory)
    } catch (error) {
      console.error("Error loading user data:", error)
      Alert.alert("Data Loading Error", "Failed to load your saved data. Some features may not work properly.")
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadUserData()
    } else {
      setFavorites([])
      setSearchHistory([])
      setEvents([])
    }
  }, [userId, loadUserData])

  const loadDefaultEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Loading default events from Ticketmaster...")

      // Try to load popular events from major cities
      const results = await searchEventsAPI("", "")

      if (results.length > 0) {
        console.log(`✅ Loaded ${results.length} default events from Ticketmaster`)
        setEvents(results)
      } else {
        console.log("ℹ️ No events from API, loading sample events")
        const sampleEvents = await getSampleEvents()
        setEvents(sampleEvents)
      }
    } catch (err: unknown) {
      console.warn("⚠️ API failed, using sample data:", err)
      try {
        const sampleEvents = await getSampleEvents()
        console.log(`📋 Loaded ${sampleEvents.length} sample events`)
        setEvents(sampleEvents)
      } catch (sampleError) {
        console.error("❌ Failed to load sample events:", sampleError)
        const errorMessage = "Failed to load events. Please check your internet connection and try again."
        setError(errorMessage)
        setEvents([])
        Alert.alert("Loading Error", errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const searchEvents = useCallback(
    async (keyword: string, city: string) => {
      if (!keyword.trim() && !city.trim()) {
        await loadDefaultEvents()
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log(`🔍 Searching for: "${keyword}" in "${city}"`)
        let results: Event[] = []

        try {
          results = await searchEventsAPI(keyword, city)
          console.log(`✅ Found ${results.length} events from Ticketmaster`)
        } catch (apiError) {
          console.warn("⚠️ API search failed, searching sample data:", apiError)
          const sampleEvents = await getSampleEvents()
          results = sampleEvents.filter(
            (event) =>
              (!keyword.trim() || event.name.toLowerCase().includes(keyword.toLowerCase())) &&
              (!city.trim() || event._embedded?.venues?.[0]?.city?.name?.toLowerCase().includes(city.toLowerCase())),
          )
          console.log(`📋 Found ${results.length} events from sample data`)

          if (results.length === 0) {
            Alert.alert(
              "No Results",
              "No events found matching your search criteria. Try different keywords or check your spelling.",
            )
          }
        }

        setEvents(results)

        // Update user stats
        if (userId && userProfile && updateUserProfile) {
          try {
            await updateUserProfile({
              stats: {
                ...userProfile.stats,
                searchCount: userProfile.stats.searchCount + 1,
              },
            })
          } catch (updateError) {
            console.error("Failed to update search count:", updateError)
            // Don't show alert for this non-critical error
          }
        }

        // Add to search history
        if (keyword.trim()) {
          await addToSearchHistory(keyword)
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to search events"
        console.error("❌ Search failed:", errorMessage)
        setError(errorMessage)
        setEvents([])
        Alert.alert("Search Error", "Failed to search for events. Please check your internet connection and try again.")
      } finally {
        setLoading(false)
      }
    },
    [userId, userProfile, updateUserProfile, loadDefaultEvents],
  )

  const loadSampleEvents = useCallback(async () => {
    try {
      console.log("📋 Loading sample events...")
      const sampleEvents = await getSampleEvents()
      setEvents(sampleEvents)
      console.log(`✅ Loaded ${sampleEvents.length} sample events`)
    } catch (error) {
      console.error("❌ Error loading sample events:", error)
      Alert.alert("Loading Error", "Failed to load sample events. Please restart the app.")
    }
  }, [])

  const toggleFavorite = useCallback(
    async (event: Event) => {
      if (!userId) {
        Alert.alert("Sign In Required", "Please sign in to save favorite events.")
        return
      }

      try {
        const isCurrentlyFavorite = favorites.some((fav) => fav.id === event.id)
        const newFavorites = isCurrentlyFavorite
          ? favorites.filter((fav) => fav.id !== event.id)
          : [...favorites, event]

        await StorageService.setFavorites(userId, newFavorites)
        setFavorites(newFavorites)

        // Show user feedback
        const message = isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites"
        Alert.alert("Success", `${event.name} ${message}`)

        if (userProfile && updateUserProfile) {
          try {
            await updateUserProfile({
              stats: {
                ...userProfile.stats,
                favoriteEvents: newFavorites.length,
              },
            })
          } catch (updateError) {
            console.error("Failed to update favorite count:", updateError)
            // Don't show alert for this non-critical error
          }
        }
      } catch (error) {
        console.error("Error toggling favorite:", error)
        Alert.alert("Error", "Failed to update favorites. Please try again.")
      }
    },
    [userId, userProfile, updateUserProfile, favorites],
  )

  const isFavorite = useCallback(
    (eventId: string) => {
      return favorites.some((fav) => fav.id === eventId)
    },
    [favorites],
  )

  const addToSearchHistory = useCallback(
    async (term: string) => {
      if (!userId) return

      try {
        await StorageService.addSearchHistory(userId, term)
        const updatedHistory = await StorageService.getSearchHistory(userId)
        setSearchHistory(updatedHistory)
      } catch (error) {
        console.error("Error adding to search history:", error)
        // Don't show alert for this non-critical error
      }
    },
    [userId],
  )

  const clearEvents = useCallback(() => {
    setEvents([])
    setError(null)
  }, [])

  const value: DataContextType = useMemo(
    () => ({
      events,
      loading,
      error,
      searchEvents,
      clearEvents,
      favorites,
      toggleFavorite,
      isFavorite,
      searchHistory,
      addToSearchHistory,
      loadSampleEvents,
      loadDefaultEvents,
    }),
    [
      events,
      loading,
      error,
      searchEvents,
      clearEvents,
      favorites,
      toggleFavorite,
      isFavorite,
      searchHistory,
      addToSearchHistory,
      loadSampleEvents,
      loadDefaultEvents,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
