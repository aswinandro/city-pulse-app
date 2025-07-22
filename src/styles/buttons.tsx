import React from "react"
import { Platform, StyleSheet, ViewStyle, TextStyle, StyleProp } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

// You can adjust this or move it to a `colors.ts` file
const colors = {
  silverStart: "#d4d4d4",
  silverEnd: "#a3a3a3",
  white: "#ffffff",
}

export const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Needed for gradient within borderRadius
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 4,
      },
    }),
  } as ViewStyle,

  text: {
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: colors.white,
  } as TextStyle,

  disabled: {
    opacity: 0.6,
  } as ViewStyle,
})

type GradientProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  startColor?: string
  endColor?: string
}

// ✅ Reusable Silver Gradient Wrapper
export const SilverGradient = ({
  children,
  style,
  startColor = colors.silverStart,
  endColor = colors.silverEnd,
}: GradientProps) => {
  return (
    <LinearGradient
      colors={[startColor, endColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[buttonStyles.base, style]}
    >
      {children}
    </LinearGradient>
  )
}
