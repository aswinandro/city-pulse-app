import { StyleSheet, I18nManager } from "react-native"

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  link: {
    marginTop: 24,
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
})
