"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { Alert } from "react-native"
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

// Export the interface so it can be imported by other files
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

  useEffect(() => {
    console.log("🔄 Setting up auth state listener...")
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("🔄 Auth state changed:", user ? `User: ${user.email}` : "No user")

        setUser(user) // Set user state immediately

        if (user) {
          console.log("✅ User authenticated, loading profile...")
          await loadUserProfile(user.uid)
        } else {
          console.log("❌ No user, clearing profile...")
          setUserProfile(null)
        }
      } catch (error) {
        console.error("❌ Error in auth state change:", error)
        Alert.alert("Authentication Error", "There was an issue with authentication. Please restart the app.")
      } finally {
        setLoading(false) // Set loading to false AFTER user and profile are potentially set
      }
    })

    return unsubscribe
  }, [loadUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log("🔄 Attempting to sign in user:", email)
      setLoading(true)

      await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Sign in successful: Firebase auth state will update.")
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
      setLoading(false)
      throw new Error(errorMessage)
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
      setLoading(false)
      throw new Error(errorMessage)
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

      // Clear local state immediately for better UX
      setUser(null)
      setUserProfile(null)

      // Sign out from Firebase
      await signOut(auth)
      console.log("✅ Logout successful")

      // Don't show alert during logout as it might interfere with navigation
      console.log("User has been successfully logged out.")
    } catch (error: unknown) {
      console.error("❌ Logout failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Logout failed"
      Alert.alert("Logout Failed", "Failed to logout. Please try again.")

      // If logout fails, we should restore the previous state
      // The onAuthStateChanged listener will handle this automatically
      throw new Error(errorMessage)
    } finally {
      // Don't set loading to false here - let onAuthStateChanged handle it
      // This prevents race conditions
    }
  }, [])

  const checkAuthState = useCallback(() => {
    // This function is primarily for initial splash screen,
    // onAuthStateChanged handles continuous state.
    if (user === null && !loading) {
      setLoading(false)
    }
  }, [user, loading])

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
