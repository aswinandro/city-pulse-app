"use client"

import { useEffect } from "react"
import { View, Text } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated"
import { useAuth } from "../providers/AuthProvider" // Still useAuth for text content

interface SplashScreenProps {
  readonly onAnimationComplete: () => void
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const { user, loading } = useAuth() // Use user and loading for text content
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 })
    logoOpacity.value = withSpring(1, { duration: 800 })

    // Animate text after logo
    textOpacity.value = withDelay(500, withSpring(1, { duration: 600 }))

    // Signal animation completion after all animations are expected to finish
    const animationTimer = setTimeout(() => {
      onAnimationComplete()
      console.log("✅ Splash screen animations complete.")
    }, 1500) // Adjust this delay to match your animation duration (e.g., 800ms + 600ms + buffer)

    return () => clearTimeout(animationTimer)
  }, [onAnimationComplete])

  // This component now only renders the splash screen UI.
  // The navigation decision is handled by app/_layout.tsx.
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
