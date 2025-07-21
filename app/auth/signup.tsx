"use client"

import { useState } from "react"
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native"
import { useRouter, Link } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../src/providers/AuthProvider"
import { useLanguage } from "../../src/hooks/useLanguage"
import LoadingSpinner from "../../src/components/common/LoadingSpinner"
import LanguageToggle from "../../src/components/common/LanguageToggle"
import { BlurView } from "expo-blur"

export default function SignUpScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const { t, isRTL } = useLanguage()
  const router = useRouter()

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert(t("error"), t("fillAllFields"))
      return
    }

    if (password !== confirmPassword) {
      Alert.alert(t("error"), t("passwordsDoNotMatch"))
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName)
      console.log("✅ Sign up successful")
    } catch (error: any) {
      Alert.alert(t("error"), error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View />
        <LanguageToggle />
      </View>

      {/* Title */}
      <View style={[styles.titleContainer, isRTL && styles.alignEnd]}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t("createAccount")}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t("signUpToContinue")}</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Full Name */}
        <View>
          <Text style={[styles.label, isRTL && styles.rtlText]}>{t("fullName")}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={t("enterFullName")}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Email */}
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
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Password */}
        <View>
          <Text style={[styles.label, isRTL && styles.rtlText]}>{t("password")}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={t("enterPassword")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Confirm Password */}
        <View>
          <Text style={[styles.label, isRTL && styles.rtlText]}>{t("confirmPassword")}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={t("enterConfirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign={isRTL ? "right" : "left"}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Submit Button */}
        <BlurView intensity={30} tint="light" style={styles.backdrop}>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <LinearGradient
              colors={["#d4d4d4", "#a3a3a3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {loading ? (
                <LoadingSpinner color="black" size="small" />
              ) : (
                <Text style={styles.buttonText}>{t("createAccount")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        {/* Sign In Link */}
        <Link href="/auth" asChild>
          <TouchableOpacity style={[styles.linkContainer, isRTL && styles.alignEnd]}>
            <Text style={[styles.linkText, isRTL && styles.rtlText]}>
              {t("alreadyHaveAccount")}
              <Text style={styles.linkBold}> {t("signIn")}</Text>
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
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 48,
  },
  titleContainer: {
    marginBottom: 30,
  },
  alignEnd: {
    alignItems: "flex-end",
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
  formContainer: {
    gap: 16,
  },
  button: {
    marginTop: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
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
  linkContainer: {
    marginTop: 24,
  },
  linkText: {
    fontSize: 15,
    color: "#4b5563",
  },
  linkBold: {
    color: "#111827",
    fontWeight: "bold",
  },
})
