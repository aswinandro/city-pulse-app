"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native"
import { Link } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../src/providers/AuthProvider"
import { useBiometric } from "../../src/hooks/useBiometric"
import { useLanguage } from "../../src/hooks/useLanguage"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"
import LanguageToggle from "../../src/components/common/LanguageToggle"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const {
    isBiometricAvailable,
    biometricType,
    hasSavedCredentials,
    authenticateWithBiometrics,
    saveBiometricCredentials,
  } = useBiometric()
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    const loadSavedEmail = async () => {
      if (hasSavedCredentials) {
        try {
          const savedCreds = await (await import("../../src/services/StorageService")).StorageService.getItem(
            "biometric_credentials",
          )
          if (savedCreds && typeof savedCreds === "object" && "email" in savedCreds) {
            setEmail(savedCreds.email as string)
          }
        } catch (e) {
          console.error("Failed to load saved email for pre-fill:", e)
        }
      }
    }
    loadSavedEmail()
  }, [hasSavedCredentials])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("error"), t("fillAllFields"))
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)

      if (isBiometricAvailable && !hasSavedCredentials) {
        Alert.alert("Enable Biometric Login?", "Would you like to enable biometric login for faster access?", [
          { text: "Not Now", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              try {
                await saveBiometricCredentials(email, password)
                Alert.alert("Success", "Biometric login enabled!")
              } catch (error) {
                console.error("Failed to save biometric credentials:", error)
                Alert.alert("Error", "Failed to enable biometric login.")
              }
            },
          },
        ])
      }
    } catch (error: any) {
      console.error("❌ Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setLoading(true)
    try {
      const credentials = await authenticateWithBiometrics()
      if (credentials) {
        await signIn(credentials.email, credentials.password)
        Alert.alert(t("success"), t("biometricLoginSuccess"))
      } else {
        Alert.alert("Biometric Failed", "Biometric authentication was cancelled or failed.")
      }
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
      <View style={styles.contentWrapper}>
        {/* Language Toggle */}
        <View style={styles.header}>
          <LanguageToggle />
        </View>

        {/* Headings */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[styles.title, isRTL && styles.rtlText]}>{t("welcome")}</Text>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t("signInToContinue")}</Text>
        </View>

        {/* Inputs */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={[styles.label, isRTL && styles.rtlText]}>{t("email")}</Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              placeholder={t("enterEmail")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign={isRTL ? "right" : "left"}
            />
          </View>

          <View>
            <Text style={[styles.label, isRTL && styles.rtlText]}>{t("password")}</Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              placeholder={t("enterPassword")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textAlign={isRTL ? "right" : "left"}
            />
          </View>
        </View>

        {/* Gradient Button with Backdrop */}
        <BlurView intensity={30} tint="light" style={styles.backdrop}>
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#d4d4d4", "#a3a3a3", "#737373"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {loading ? (
                <LoadingSpinner color="white" size="small" />
              ) : (
                <Text style={styles.loginText}>{t("signIn")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        {/* Biometric */}
        {isBiometricAvailable && hasSavedCredentials && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin} disabled={loading}>
            <Ionicons name="finger-print" size={22} color="#52525b" />
            <Text style={styles.biometricText}>{t("biometricLogin")}</Text>
          </TouchableOpacity>
        )}

        {/* Signup Link */}
        <Link href="/auth/signup" asChild>
          <TouchableOpacity>
            <Text style={[styles.signupText, isRTL && styles.rtlText]}>
              {t("dontHaveAccount")}
              <Text style={styles.signupLink}> {t("signUp")}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    paddingHorizontal: 24,
    maxWidth: 400,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  label: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: "#d1d5db",
    borderWidth: 1,
    fontSize: 16,
  },
  rtlInput: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  rtlText: {
    textAlign: "right",
  },
  loginButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loginText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 17,
  },
  disabledButton: {
    opacity: 0.6,
  },
  backdrop: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  biometricButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#a1a1aa",
    borderRadius: 10,
    gap: 8,
  },
  biometricText: {
    color: "#52525b",
    fontSize: 16,
    fontWeight: "500",
  },
  signupText: {
    marginTop: 24,
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
  },
  signupLink: {
    color: "#111827",
    fontWeight: "bold",
  },
})
