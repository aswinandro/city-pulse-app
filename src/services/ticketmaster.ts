import axios from "axios"
import type { Event } from "../types/Event"

const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY
const BASE_URL = "https://app.ticketmaster.com/discovery/v2"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 Ticketmaster API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log(`🔑 API Key present: ${TICKETMASTER_API_KEY ? "Yes" : "No"}`)
    if (config.params) {
      console.log("📋 Request params:", config.params)
    }
    return config
  },
  (error) => {
    console.error("🚨 API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Ticketmaster API Response: ${response.status} ${response.config.url}`)
    console.log(`📊 Events found: ${response.data._embedded?.events?.length || 0}`)
    return response
  },
  (error) => {
    console.error("🚨 Ticketmaster API Response Error:", error.response?.status, error.message)
    if (error.response?.data) {
      console.error("📋 Error details:", error.response.data)
    }
    return Promise.reject(error)
  },
)

export const searchEventsAPI = async (
  keyword: string,
  city: string,
  page = 0,
  size = 20,
): Promise<{ events: Event[]; totalElements: number; totalPages: number }> => {
  try {
    if (!TICKETMASTER_API_KEY) {
      console.warn("⚠️ Ticketmaster API key not configured")
      throw new Error("API configuration missing. Using sample data instead.")
    }

    const params: Record<string, string | number> = {
      apikey: TICKETMASTER_API_KEY,
      size: size,
      page: page, // Add page parameter
      sort: "date,asc",
      // Removed hardcoded countryCode: "US" to allow global search
    }

    // Add keyword if provided
    if (keyword.trim()) {
      params.keyword = keyword.trim()
    }

    // Add city if provided, otherwise no city parameter for global search
    if (city.trim()) {
      params.city = city.trim()
    }

    console.log("🔍 Searching Ticketmaster with params:", params)

    const response = await api.get("/events.json", { params })

    const events = (response.data._embedded?.events || []) as Event[]
    const totalElements = response.data.page?.totalElements || 0
    const totalPages = response.data.page?.totalPages || 0

    console.log(`✅ Found ${events.length} events from Ticketmaster (Page ${page + 1}/${totalPages})`)

    // Log first event for debugging
    if (events.length > 0) {
      console.log("📋 Sample event:", {
        name: events[0].name,
        date: events[0].dates?.start?.localDate,
        venue: events[0]._embedded?.venues?.[0]?.name,
      })
    }

    return { events, totalElements, totalPages }
  } catch (error: unknown) {
    console.error("❌ Ticketmaster API Error:", error)

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Invalid Ticketmaster API key. Please contact support.")
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.")
      } else if (error.response?.status === 400) {
        throw new Error("Invalid search terms. Please try different keywords.")
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Connection timeout. Please check your internet connection.")
      } else if (error.code === "NETWORK_ERROR") {
        throw new Error("Network error. Please check your internet connection.")
      }
    }

    throw new Error("Unable to search events at the moment. Please try again later.")
  }
}
