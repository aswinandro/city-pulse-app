"use client"

import { useEffect } from "react"
import { View, Text } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated"
import { useAuth } from "../providers/AuthProvider" // Corrected import path

export default function SplashScreen() {
  const { checkAuthState } = useAuth()
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 8 })
    logoOpacity.value = withSpring(1)

    // Animate text after logo
    textOpacity.value = withDelay(500, withSpring(1))

    // Check auth state after animations
    const timer = setTimeout(() => {
      checkAuthState()
    }, 2000)

    return () => clearTimeout(timer)
  }, [checkAuthState, logoOpacity, logoScale, textOpacity]) // Added dependencies

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  return (
    <View className="flex-1 bg-primary-600 justify-center items-center">
      <Animated.View style={logoAnimatedStyle} className="mb-8">
        <View className="w-24 h-24 bg-white rounded-full justify-center items-center">
          <Text className="text-4xl">🏛️</Text>
        </View>
      </Animated.View>

      <Animated.View style={textAnimatedStyle}>
        <Text className="text-white text-3xl font-bold mb-2">City Pulse</Text>
        <Text className="text-primary-100 text-lg">Discover Local Events</Text>
      </Animated.View>
    </View>
  )
}
