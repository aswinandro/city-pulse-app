"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "../services/firebase"
import { StorageService } from "../services/StorageService"
import type { UserProfile } from "../types/User"

// Export interface
export interface AuthContextType {
  readonly user: User | null
  readonly userProfile: UserProfile | null
  readonly loading: boolean
  readonly signIn: (email: string, password: string) => Promise<void>
  readonly signUp: (email: string, password: string, displayName: string) => Promise<void>
  readonly logout: () => Promise<void>
  readonly updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  readonly checkAuthState: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = useCallback(async (uid: string) => {
    try {
      const profile = await StorageService.getUserData<UserProfile>(uid)
      if (profile) {
        setUserProfile(profile)
        console.log("✅ User profile loaded:", profile.displayName)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      Alert.alert("Error", "Failed to load user profile. Please try again.")
    }
  }, [])

  // Wrap first onAuthStateChanged event into a Promise
  const waitForFirstAuthState = (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }

  useEffect(() => {
    let isMounted = true

    const checkFreshInstallAndSetupAuth = async () => {
      try {
        // Check if app launched before
        const hasLaunched = await AsyncStorage.getItem("hasLaunched")

        // If fresh install, force sign out
        if (!hasLaunched) {
          console.log("🆕 Fresh install detected. Signing out user (if any)...")
          await signOut(auth)
          await AsyncStorage.setItem("hasLaunched", "true")
        }

        if (!isMounted) return

        // Wait for the first auth state change event
        console.log("🔄 Waiting for first auth state event...")
        const firebaseUser = await waitForFirstAuthState()

        if (!isMounted) return

        if (firebaseUser) {
          setUser(firebaseUser)
          await loadUserProfile(firebaseUser.uid)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error("❌ Error during app startup:", error)
        Alert.alert("Startup Error", "An error occurred during app startup.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkFreshInstallAndSetupAuth()

    return () => {
      isMounted = false
    }
  }, [loadUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log("🔄 Attempting to sign in user:", email)
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Sign in successful:", userCredential.user.email)

      const existingProfile = await StorageService.getUserData<UserProfile>(userCredential.user.uid)
      if (existingProfile) {
        const updatedProfile: UserProfile = {
          ...existingProfile,
          lastLoginAt: new Date().toISOString(),
        }
        await StorageService.setUserData(userCredential.user.uid, updatedProfile)
      }
    } catch (error: unknown) {
      console.error("❌ Sign in failed:", error)
      let errorMessage = "Failed to sign in. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("user-not-found")) {
          errorMessage = "No account found with this email address."
        } else if (error.message.includes("wrong-password")) {
          errorMessage = "Incorrect password. Please try again."
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message.includes("too-many-requests")) {
          errorMessage = "Too many failed attempts. Please try again later."
        }
      }

      Alert.alert("Sign In Failed", errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      console.log("🔄 Attempting to sign up user:", email)
      setLoading(true)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("✅ Sign up successful:", user.email)

      const newUserProfile: UserProfile = {
        uid: user.uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          language: "en",
          notifications: true,
          theme: "light",
        },
        stats: {
          eventsViewed: 0,
          favoriteEvents: 0,
          searchCount: 0,
        },
      }

      await StorageService.setUserData(user.uid, newUserProfile)
      setUserProfile(newUserProfile)

      Alert.alert("Welcome!", `Account created successfully for ${displayName}!`)
    } catch (error: unknown) {
      console.error("❌ Sign up failed:", error)
      let errorMessage = "Failed to create account. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("email-already-in-use")) {
          errorMessage = "An account with this email already exists."
        } else if (error.message.includes("weak-password")) {
          errorMessage = "Password should be at least 6 characters long."
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Please enter a valid email address."
        }
      }

      Alert.alert("Sign Up Failed", errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user || !userProfile) return

      try {
        const updatedProfile: UserProfile = { ...userProfile, ...updates }
        await StorageService.setUserData(user.uid, updatedProfile)
        setUserProfile(updatedProfile)
      } catch (error) {
        console.error("Error updating user profile:", error)
        Alert.alert("Update Failed", "Failed to update profile. Please try again.")
        throw error
      }
    },
    [user, userProfile],
  )

  const logout = useCallback(async () => {
    try {
      console.log("🔄 Logging out user...")
      setLoading(true)

      setUser(null)
      setUserProfile(null)
      await signOut(auth)

      console.log("✅ Logout successful")
      Alert.alert("Logged Out", "You have been successfully logged out.")
    } catch (error: unknown) {
      console.error("❌ Logout failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Logout failed"
      Alert.alert("Logout Failed", "Failed to logout. Please try again.")
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAuthState = useCallback(() => {
    setLoading(false)
  }, [])

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    checkAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
