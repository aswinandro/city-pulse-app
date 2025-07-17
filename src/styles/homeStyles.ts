import { StyleSheet, I18nManager } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // gray-50
  },
  header: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff", // white
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // gray-200
  },
  headingContainer: {
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937", // gray-800
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280", // gray-500
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  errorBox: {
    backgroundColor: "#fee2e2", // red-100
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
  errorText: {
    color: "#991b1b", // red-800
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
})
