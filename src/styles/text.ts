import { Platform, StyleSheet } from "react-native"

export const textStyles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: "#2d3436",
  },
  subheading: {
    fontSize: 18,
    color: "#636e72",
  },
  paragraph: {
    fontSize: 16,
    color: "#2d3436",
  },
})
