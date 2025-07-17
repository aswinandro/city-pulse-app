"use client"

import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLanguage } from "../../hooks/useLanguage"
import { LinearGradient } from "expo-linear-gradient"

interface SearchBarProps {
  readonly searchQuery: string
  readonly city: string
  readonly onSearchQueryChange: (query: string) => void
  readonly onCityChange: (city: string) => void
  readonly onSearch: () => void
  readonly loading: boolean
}

export default function SearchBar({
  searchQuery,
  city,
  onSearchQueryChange,
  onCityChange,
  onSearch,
  loading,
}: SearchBarProps) {
  const { t, isRTL } = useLanguage()

  return (
    <View style={[styles.container, isRTL && { direction: "rtl" }]}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.row, isRTL && styles.rowReverse]}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B7280"
            style={isRTL ? styles.iconRTL : styles.icon}
          />
          <TextInput
            style={[
              styles.textInput,
              { textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" },
            ]}
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>
      </View>

      {/* City Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.row, isRTL && styles.rowReverse]}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#6B7280"
            style={isRTL ? styles.iconRTL : styles.icon}
          />
          <TextInput
            style={[
              styles.textInput,
              { textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" },
            ]}
            placeholder={t("cityPlaceholder")}
            value={city}
            onChangeText={onCityChange}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>
      </View>

      {/* Gradient Search Button */}
      <TouchableOpacity onPress={onSearch} disabled={loading} activeOpacity={0.8}>
        <LinearGradient
          colors={["#111827", "#737373"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, loading && styles.disabledButton]}
        >
          <View style={[styles.row, isRTL && styles.rowReverse]}>
            {loading ? (
              <Ionicons name="hourglass-outline" size={20} color="white" />
            ) : (
              <>
                <Ionicons
                  name="search"
                  size={18}
                  color="white"
                  style={isRTL ? styles.iconRTL : styles.icon}
                />
                <Text style={styles.buttonText}>{t("search")}</Text>
              </>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  icon: {
    marginRight: 12,
  },
  iconRTL: {
    marginLeft: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: "#fff",
  },
})
