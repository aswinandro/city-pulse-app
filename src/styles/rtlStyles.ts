// src/styles/rtlStyles.ts
import { I18nManager, StyleSheet } from "react-native"

export const isRTL = I18nManager.isRTL

export const rtlStyle = StyleSheet.create({
  textAlign: {
    textAlign: isRTL ? "right" : "left",
  },
  row: {
    flexDirection: isRTL ? "row-reverse" : "row",
  },
  iconSpacing: {
    marginRight: isRTL ? 0 : 12,
    marginLeft: isRTL ? 12 : 0,
  },
  textDirection: {
    writingDirection: isRTL ? "rtl" : "ltr",
  },
})
