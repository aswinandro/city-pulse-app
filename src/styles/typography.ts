import { I18nManager, StyleSheet } from "react-native"
import { colors } from "./colors"

export const typography = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: I18nManager.isRTL ? "right" : "left",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  subheading: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: I18nManager.isRTL ? "right" : "left",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: I18nManager.isRTL ? "right" : "left",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: I18nManager.isRTL ? "right" : "left",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  linkTextHighlight: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
})
