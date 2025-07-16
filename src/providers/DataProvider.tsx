"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { StorageService } from "@/services/StorageService"
import { searchEventsAPI } from "@/services/ticketmaster"
import { getSampleEvents } from "@/services/DataSeeder"
import { useAuth } from "@/providers/AuthProvider"
import type { Event } from "@/types/Event"

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

  const loadUserData = useCallback(async () => {
    if (!user) return

    try {
      const [userFavorites, userSearchHistory] = await Promise.all([
        StorageService.getFavorites<Event>(user.uid),
        StorageService.getSearchHistory(user.uid),
      ])

      setFavorites(userFavorites)
      setSearchHistory(userSearchHistory)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setFavorites([])
      setSearchHistory([])
      setEvents([])
    }
  }, [user, loadUserData])

  const searchEvents = useCallback(
    async (keyword: string, city: string) => {
      if (!keyword.trim() && !city.trim()) {
        setEvents([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        let results: Event[] = []

        try {
          results = await searchEventsAPI(keyword, city)
        } catch (apiError) {
          console.warn("API failed, using sample data:", apiError)
          const sampleEvents = await getSampleEvents()
          results = sampleEvents.filter(
            (event) =>
              event.name.toLowerCase().includes(keyword.toLowerCase()) ||
              event._embedded?.venues?.[0]?.city?.name?.toLowerCase().includes(city.toLowerCase()),
          )
        }

        setEvents(results)

        if (user && userProfile) {
          await updateUserProfile({
            stats: {
              ...userProfile.stats,
              searchCount: userProfile.stats.searchCount + 1,
            },
          })
        }

        if (keyword.trim()) {
          await addToSearchHistory(keyword)
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to search events"
        setError(errorMessage)
        setEvents([])
      } finally {
        setLoading(false)
      }
    },
    [user, userProfile, updateUserProfile, searchHistory],
  )

  const loadSampleEvents = useCallback(async () => {
    try {
      const sampleEvents = await getSampleEvents()
      setEvents(sampleEvents)
    } catch (error) {
      console.error("Error loading sample events:", error)
    }
  }, [])

  const toggleFavorite = useCallback(
    async (event: Event) => {
      if (!user) return

      try {
        const isCurrentlyFavorite = favorites.some((fav) => fav.id === event.id)
        const newFavorites = isCurrentlyFavorite
          ? favorites.filter((fav) => fav.id !== event.id)
          : [...favorites, event]

        await StorageService.setFavorites(user.uid, newFavorites)
        setFavorites(newFavorites)

        if (userProfile) {
          await updateUserProfile({
            stats: {
              ...userProfile.stats,
              favoriteEvents: newFavorites.length,
            },
          })
        }
      } catch (error) {
        console.error("Error toggling favorite:", error)
      }
    },
    [user, userProfile, updateUserProfile, favorites],
  )

  const isFavorite = useCallback(
    (eventId: string) => {
      return favorites.some((fav) => fav.id === eventId)
    },
    [favorites],
  )

  const addToSearchHistory = useCallback(
    async (term: string) => {
      if (!user) return

      try {
        await StorageService.addSearchHistory(user.uid, term)
        const updatedHistory = await StorageService.getSearchHistory(user.uid)
        setSearchHistory(updatedHistory)
      } catch (error) {
        console.error("Error adding to search history:", error)
      }
    },
    [user],
  )

  const clearEvents = useCallback(() => {
    setEvents([])
    setError(null)
  }, [])

  const value: DataContextType = {
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
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
