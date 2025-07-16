"use client"

import { useState, useEffect, useCallback } from "react"
import * as LocalAuthentication from "expo-local-authentication"

interface BiometricHook {
  readonly isBiometricAvailable: boolean
  readonly biometricType: string | null
  readonly authenticateWithBiometrics: () => Promise<boolean>
  readonly checkBiometricAvailability: () => Promise<void>
}

export const useBiometric = (): BiometricHook => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState<string | null>(null)

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
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error)
      setIsBiometricAvailable(false)
    }
  }, [])

  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      if (!isBiometricAvailable) {
        throw new Error("Biometric authentication not available")
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access City Pulse",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      })

      return result.success
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Biometric authentication failed"
      throw new Error(errorMessage)
    }
  }, [isBiometricAvailable])

  useEffect(() => {
    checkBiometricAvailability()
  }, [checkBiometricAvailability])

  return {
    isBiometricAvailable,
    biometricType,
    authenticateWithBiometrics,
    checkBiometricAvailability,
  }
}
