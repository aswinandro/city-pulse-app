import axios from "axios"
import type { Event } from "@/types/Event"

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
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("🚨 API Response Error:", error.response?.status, error.message)
    return Promise.reject(error)
  },
)

export const searchEventsAPI = async (keyword: string, city: string): Promise<Event[]> => {
  try {
    if (!TICKETMASTER_API_KEY) {
      throw new Error("Ticketmaster API key not configured")
    }

    const params: Record<string, string | number> = {
      apikey: TICKETMASTER_API_KEY,
      size: 20,
      sort: "date,asc",
    }

    if (keyword.trim()) {
      params.keyword = keyword.trim()
    }

    if (city.trim()) {
      params.city = city.trim()
    }

    const response = await api.get("/events.json", { params })

    if (response.data._embedded?.events) {
      return response.data._embedded.events as Event[]
    }

    return []
  } catch (error: unknown) {
    console.error("Ticketmaster API Error:", error)

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Invalid API key. Please check your Ticketmaster API configuration.")
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please try again later.")
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please check your internet connection.")
      }
    }

    throw new Error("Failed to search events. Please try again.")
  }
}
