"use client"

import { useEffect } from "react"
import { View, Text } from "react-native"
import { useRouter } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated"
import { useAuth } from "@/providers/AuthProvider"

export default function SplashScreen() {
  const { user, loading, checkAuthState } = useAuth()
  const router = useRouter()
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)

  const navigateToNextScreen = () => {
    if (user) {
      router.replace("/(tabs)")
    } else {
      router.replace("/auth")
    }
  }

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 })
    logoOpacity.value = withSpring(1, { duration: 800 })

    // Animate text after logo
    textOpacity.value = withDelay(500, withSpring(1, { duration: 600 }))

    // Check auth state and navigate
    const timer = setTimeout(() => {
      checkAuthState()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading) {
      // Add a small delay for smooth transition
      const navigationTimer = setTimeout(navigateToNextScreen, 500)
      return () => clearTimeout(navigationTimer)
    }
  }, [user, loading])

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
        <Text className="text-primary-100 text-lg font-medium">Discover Local Events</Text>
      </Animated.View>
    </View>
  )
}
