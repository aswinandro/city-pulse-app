"use client"

import type { ReactNode } from "react"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { Alert } from "react-native"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  type User,
} from "firebase/auth"
import { auth } from "../services/firebase"
import { StorageService } from "../services/StorageService"
import * as SecureStore from "expo-secure-store"
import type { UserProfile } from "../types/User"

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
  const [authChecked, setAuthChecked] = useState(false)

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await getIdToken(firebaseUser, true)
          if (!token) {
            throw new Error("Invalid Firebase token.")
          }

          setUser(firebaseUser)
          await loadUserProfile(firebaseUser.uid)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error("❌ Invalid auth state:", error)
        setUser(null)
        setUserProfile(null)
        await SecureStore.deleteItemAsync("firebaseCredentials")
        Alert.alert("Session Error", "Authentication failed. Please sign in again.")
      } finally {
        setLoading(false)
        setAuthChecked(true)
      }
    })

    return unsubscribe
  }, [loadUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      await SecureStore.setItemAsync("firebaseCredentials", JSON.stringify({ email, password }))

      const existingProfile = await StorageService.getUserData<UserProfile>(userCredential.user.uid)
      if (existingProfile) {
        const updatedProfile: UserProfile = {
          ...existingProfile,
          lastLoginAt: new Date().toISOString(),
        }
        await StorageService.setUserData(userCredential.user.uid, updatedProfile)
      }
    } catch (error) {
      console.error("❌ Sign in failed:", error)
      await SecureStore.deleteItemAsync("firebaseCredentials")

      let errorMessage = "Failed to sign in. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("user-not-found")) {
          errorMessage = "No account found with this email."
        } else if (error.message.includes("wrong-password")) {
          errorMessage = "Incorrect password."
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Invalid email format."
        } else if (error.message.includes("too-many-requests")) {
          errorMessage = "Too many attempts. Try again later."
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
      setLoading(true)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await SecureStore.setItemAsync("firebaseCredentials", JSON.stringify({ email, password }))

      const newUserProfile: UserProfile = {
        uid: userCredential.user.uid,
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

      await StorageService.setUserData(userCredential.user.uid, newUserProfile)
      setUserProfile(newUserProfile)

      Alert.alert("Welcome!", `Account created successfully for ${displayName}!`)
    } catch (error) {
      console.error("❌ Sign up failed:", error)
      await SecureStore.deleteItemAsync("firebaseCredentials")

      let errorMessage = "Failed to create account."
      if (error instanceof Error) {
        if (error.message.includes("email-already-in-use")) {
          errorMessage = "Email already in use."
        } else if (error.message.includes("weak-password")) {
          errorMessage = "Password should be at least 6 characters."
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Please enter a valid email."
        }
      }

      Alert.alert("Sign Up Failed", errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return
    try {
      const updated = { ...userProfile, ...updates }
      await StorageService.setUserData(user.uid, updated)
      setUserProfile(updated)
    } catch (error) {
      console.error("Update failed:", error)
      Alert.alert("Update Failed", "Could not update your profile.")
      throw error
    }
  }, [user, userProfile])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      setUser(null)
      setUserProfile(null)
      await SecureStore.deleteItemAsync("firebaseCredentials")
      await signOut(auth)
      Alert.alert("Logged Out", "Successfully logged out.")
    } catch (error) {
      console.error("Logout failed:", error)
      Alert.alert("Logout Failed", "An error occurred during logout.")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAuthState = useCallback(() => {
    setAuthChecked(true)
    setLoading(false)
  }, [])

  const value: AuthContextType = {
    user,
    userProfile,
    loading: !authChecked || loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    checkAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
