import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Event } from "../types/Event"

const SAMPLE_EVENTS: Event[] = [
  {
    id: "sample-1",
    name: "Summer Music Festival 2024",
    type: "concert",
    url: "https://example.com/tickets",
    images: [
      {
        ratio: "16_9",
        url: "https://picsum.photos/800/450?random=1",
        width: 800,
        height: 450,
        fallback: false,
      },
    ],
    dates: {
      start: {
        localDate: "2024-07-15",
        localTime: "19:00:00",
      },
    },
    classifications: [
      {
        segment: { id: "music", name: "Music" },
        genre: { id: "rock", name: "Rock" },
      },
    ],
    priceRanges: [
      {
        type: "standard",
        currency: "USD",
        min: 45,
        max: 150,
      },
    ],
    info: "Join us for an unforgettable night of live music featuring top artists from around the world.",
    _embedded: {
      venues: [
        {
          name: "Central Park Amphitheater",
          type: "venue",
          id: "venue-1",
          test: false,
          url: "https://example.com/venue",
          locale: "en-us",
          city: { name: "New York" },
          state: { name: "New York", stateCode: "NY" },
          country: { name: "United States", countryCode: "US" },
          address: { line1: "1234 Park Avenue" },
          location: {
            longitude: "-73.9712",
            latitude: "40.7831",
          },
        },
      ],
    },
  },
  {
    id: "sample-2",
    name: "Tech Innovation Conference",
    type: "conference",
    url: "https://example.com/tech-conf",
    images: [
      {
        ratio: "16_9",
        url: "https://picsum.photos/800/450?random=2",
        width: 800,
        height: 450,
        fallback: false,
      },
    ],
    dates: {
      start: {
        localDate: "2024-08-20",
        localTime: "09:00:00",
      },
    },
    classifications: [
      {
        segment: { id: "tech", name: "Technology" },
        genre: { id: "conference", name: "Conference" },
      },
    ],
    priceRanges: [
      {
        type: "standard",
        currency: "USD",
        min: 200,
        max: 500,
      },
    ],
    info: "Discover the latest innovations in technology with industry leaders and networking opportunities.",
    _embedded: {
      venues: [
        {
          name: "Convention Center",
          type: "venue",
          id: "venue-2",
          test: false,
          url: "https://example.com/venue2",
          locale: "en-us",
          city: { name: "San Francisco" },
          state: { name: "California", stateCode: "CA" },
          country: { name: "United States", countryCode: "US" },
          address: { line1: "5678 Tech Boulevard" },
          location: {
            longitude: "-122.4194",
            latitude: "37.7749",
          },
        },
      ],
    },
  },
  {
    id: "sample-3",
    name: "Food & Wine Festival",
    type: "festival",
    url: "https://example.com/food-wine",
    images: [
      {
        ratio: "16_9",
        url: "https://picsum.photos/800/450?random=3",
        width: 800,
        height: 450,
        fallback: false,
      },
    ],
    dates: {
      start: {
        localDate: "2024-09-10",
        localTime: "12:00:00",
      },
    },
    classifications: [
      {
        segment: { id: "food", name: "Food & Drink" },
        genre: { id: "festival", name: "Festival" },
      },
    ],
    priceRanges: [
      {
        type: "standard",
        currency: "USD",
        min: 75,
        max: 200,
      },
    ],
    info: "Experience culinary delights from renowned chefs and premium wine tastings.",
    _embedded: {
      venues: [
        {
          name: "Waterfront Park",
          type: "venue",
          id: "venue-3",
          test: false,
          url: "https://example.com/venue3",
          locale: "en-us",
          city: { name: "Miami" },
          state: { name: "Florida", stateCode: "FL" },
          country: { name: "United States", countryCode: "US" },
          address: { line1: "9876 Ocean Drive" },
          location: {
            longitude: "-80.1918",
            latitude: "25.7617",
          },
        },
      ],
    },
  },
]

export const seedInitialData = async () => {
  try {
    const existingEvents = await AsyncStorage.getItem("sample_events")

    if (!existingEvents) {
      await AsyncStorage.setItem("sample_events", JSON.stringify(SAMPLE_EVENTS))
      console.log("✅ Sample events seeded successfully")
    }

    const appMetadata = {
      version: "1.0.0",
      lastSeeded: new Date().toISOString(),
      dataVersion: "1.0",
    }
    await AsyncStorage.setItem("app_metadata", JSON.stringify(appMetadata))
  } catch (error) {
    console.error("❌ Error seeding initial data:", error)
  }
}

export const getSampleEvents = async (): Promise<Event[]> => {
  try {
    const events = await AsyncStorage.getItem("sample_events")
    return events ? JSON.parse(events) : []
  } catch (error) {
    console.error("Error getting sample events:", error)
    return []
  }
}
