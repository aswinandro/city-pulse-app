"use client"

import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useLanguage } from "@/hooks/useLanguage" // Corrected import path

export default function TabLayout() {
  const { t } = useLanguage()

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "favorites") {
            iconName = focused ? "heart" : "heart-outline"
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline"
          } else {
            iconName = "home-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: t("home") }} />
      <Tabs.Screen name="favorites" options={{ tabBarLabel: t("favorites") }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: t("profile") }} />
    </Tabs>
  )
}
