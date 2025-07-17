import { Platform, StyleSheet } from "react-native"

export const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Important for rounded gradient
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
  },
  text: {
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: "#fff",
  },
  disabled: {
    opacity: 0.6,
  },
})
