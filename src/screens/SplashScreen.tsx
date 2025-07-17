"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ImageErrorEventData,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated"
import { useAuth } from "../providers/AuthProvider"

interface SplashScreenProps {
  readonly onAnimationComplete: () => void
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const { user, loading } = useAuth()
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const [imageError, setImageError] = useState(false)

  const screenWidth = Dimensions.get("window").width
  const imageSize = screenWidth * 0.6 // 60% of screen width

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 })
    logoOpacity.value = withSpring(1, { duration: 800 })
    textOpacity.value = withDelay(500, withSpring(1, { duration: 600 }))

    const animationTimer = setTimeout(() => {
      onAnimationComplete()
      console.log("✅ Splash screen animations complete.")
    }, 1500)

    return () => clearTimeout(animationTimer)
  }, [onAnimationComplete])

  return (
    <View className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 justify-center items-center">
      <Animated.View style={logoAnimatedStyle} className="mb-8">
        {imageError ? (
          <View
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: 999,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ fontSize: 60 }}>🏛️</Text>
          </View>
        ) : (
          <Image
            source={require("../../assets/splash.png")} // Adjust path if needed
            onError={(e: NativeSyntheticEvent<ImageErrorEventData>) => {
              console.warn("⚠️ Splash image failed to load:", e.nativeEvent.error)
              setImageError(true)
            }}
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
            resizeMode="contain"
          />
        )}
      </Animated.View>

      <Animated.View style={textAnimatedStyle} className="items-center">
        <Text className="text-white text-3xl font-bold mb-2 tracking-wide">City Pulse</Text>
        <Text className="text-primary-100 text-lg font-medium">
          {loading ? "Initializing..." : user ? "Welcome to City Pulse App!" : "Discover Local Events"}
        </Text>
      </Animated.View>
    </View>
  )
}
