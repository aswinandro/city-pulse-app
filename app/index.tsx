"use client"

import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useRouter } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated"
import { useAuth } from "../src/providers/AuthProvider"

export default function SplashScreen() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [initialLoad, setInitialLoad] = useState(true)
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 })
    logoOpacity.value = withSpring(1, { duration: 800 })

    // Animate text after logo
    textOpacity.value = withDelay(500, withSpring(1, { duration: 600 }))
  }, [])

  useEffect(() => {
    // Only navigate after initial loading is complete
    if (!loading) {
      const timer = setTimeout(
        () => {
          console.log("🔄 Navigation check - User:", user ? `${user.email} authenticated` : "not authenticated")

          if (user) {
            console.log("✅ User authenticated, navigating to tabs")
            router.replace("/(tabs)")
          } else {
            console.log("❌ User not authenticated, navigating to auth")
            router.replace("/auth")
          }

          setInitialLoad(false)
        },
        initialLoad ? 1500 : 100,
      ) // Shorter delay for subsequent navigations

      return () => clearTimeout(timer)
    }
  }, [user, loading, router, initialLoad])

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  return (
    <View className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 justify-center items-center">
      <Animated.View style={logoAnimatedStyle} className="mb-8">
        <View className="w-24 h-24 bg-white rounded-full justify-center items-center shadow-2xl">
          <Text className="text-4xl">🏛️</Text>
        </View>
      </Animated.View>

      <Animated.View style={textAnimatedStyle} className="items-center">
        <Text className="text-white text-3xl font-bold mb-2 tracking-wide">City Pulse</Text>
        <Text className="text-primary-100 text-lg font-medium">
          {loading ? "Initializing..." : user ? "Welcome back!" : "Discover Local Events"}
        </Text>
      </Animated.View>
    </View>
  )
}
