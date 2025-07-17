"use client"

import { useState, useEffect, useCallback } from "react"
import * as LocalAuthentication from "expo-local-authentication"
import { StorageService } from "../services/StorageService"

interface BiometricCredentials {
  readonly email: string
  readonly hashedPassword: string
}

interface BiometricHook {
  readonly isBiometricAvailable: boolean
  readonly biometricType: string | null
  readonly hasSavedCredentials: boolean
  readonly authenticateWithBiometrics: () => Promise<BiometricCredentials | null>
  readonly saveBiometricCredentials: (email: string, password: string) => Promise<void>
  readonly clearBiometricCredentials: () => Promise<void>
  readonly checkBiometricAvailability: () => Promise<void>
}

// Simple hash function for demo purposes - in production, use proper encryption
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

export const useBiometric = (): BiometricHook => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState<string | null>(null)
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false)

  const checkBiometricAvailability = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

      setIsBiometricAvailable(hasHardware && isEnrolled)

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("Face ID")
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("Touch ID")
      } else {
        setBiometricType("Biometric")
      }

      // Check if we have saved credentials
      const savedCredentials = await StorageService.getItem<BiometricCredentials>("biometric_credentials")
      setHasSavedCredentials(!!savedCredentials)
    } catch (error) {
      console.error("Error checking biometric availability:", error)
      setIsBiometricAvailable(false)
    }
  }, [])

  const saveBiometricCredentials = useCallback(async (email: string, password: string) => {
    try {
      const credentials: BiometricCredentials = {
        email,
        hashedPassword: simpleHash(password),
      }
      await StorageService.setItem("biometric_credentials", credentials)
      setHasSavedCredentials(true)
      console.log("✅ Biometric credentials saved")
    } catch (error) {
      console.error("Error saving biometric credentials:", error)
      throw new Error("Failed to save biometric credentials")
    }
  }, [])

  const clearBiometricCredentials = useCallback(async () => {
    try {
      await StorageService.removeItem("biometric_credentials")
      setHasSavedCredentials(false)
      console.log("✅ Biometric credentials cleared")
    } catch (error) {
      console.error("Error clearing biometric credentials:", error)
    }
  }, [])

  const authenticateWithBiometrics = useCallback(async (): Promise<BiometricCredentials | null> => {
    try {
      if (!isBiometricAvailable) {
        throw new Error("Biometric authentication not available")
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access City Pulse",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      })

      if (result.success) {
        const savedCredentials = await StorageService.getItem<BiometricCredentials>("biometric_credentials")
        if (savedCredentials) {
          console.log("✅ Biometric authentication successful, returning credentials")
          return savedCredentials
        } else {
          throw new Error("No saved credentials found")
        }
      } else {
        return null
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Biometric authentication failed"
      console.error("❌ Biometric authentication error:", errorMessage)
      throw new Error(errorMessage)
    }
  }, [isBiometricAvailable])

  useEffect(() => {
    checkBiometricAvailability()
  }, [checkBiometricAvailability])

  return {
    isBiometricAvailable,
    biometricType,
    hasSavedCredentials,
    authenticateWithBiometrics,
    saveBiometricCredentials,
    clearBiometricCredentials,
    checkBiometricAvailability,
  }
}
