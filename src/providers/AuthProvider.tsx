"use client"

import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react"
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
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
      console.error("❌ Error loading user profile:", error)
      Alert.alert("Error", "Failed to load user profile.")
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const isFirstInstall = await AsyncStorage.getItem("firstInstallDone")

        if (!isFirstInstall) {
          console.log("🆕 First install — forcing logout")
          await signOut(auth)
          await AsyncStorage.setItem("firstInstallDone", "true")
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe()
          if (!isMounted) return

          if (firebaseUser) {
            console.log("✅ Firebase auth state found:", firebaseUser.email)
            setUser(firebaseUser)
            await loadUserProfile(firebaseUser.uid)
          } else {
            console.log("👤 No user found")
            setUser(null)
            setUserProfile(null)
          }
          setLoading(false)
        })
      } catch (error) {
        console.error("❌ Auth initialization failed:", error)
        Alert.alert("Startup Error", "Failed to initialize authentication.")
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [loadUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password)
      setUser(loggedInUser)

      const profile = await StorageService.getUserData<UserProfile>(loggedInUser.uid)
      if (profile) {
        const updatedProfile = {
          ...profile,
          lastLoginAt: new Date().toISOString(),
        }
        await StorageService.setUserData(loggedInUser.uid, updatedProfile)
        setUserProfile(updatedProfile)
      }
    } catch (error: any) {
      console.error("Sign in failed:", error)
      let message = "Failed to sign in."
      if (error.message?.includes("user-not-found")) message = "No account found."
      else if (error.message?.includes("wrong-password")) message = "Wrong password."
      else if (error.message?.includes("invalid-email")) message = "Invalid email."
      else if (error.message?.includes("too-many-requests")) message = "Too many attempts."

      Alert.alert("Sign In Failed", message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true)
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
      setUser(newUser)

      const newProfile: UserProfile = {
        uid: newUser.uid,
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

      await StorageService.setUserData(newUser.uid, newProfile)
      setUserProfile(newProfile)
      Alert.alert("Welcome!", `Account created for ${displayName}`)
    } catch (error: any) {
      console.error("Sign up failed:", error)
      let message = "Failed to sign up."
      if (error.message?.includes("email-already-in-use")) message = "Email already in use."
      else if (error.message?.includes("weak-password")) message = "Weak password."
      else if (error.message?.includes("invalid-email")) message = "Invalid email."

      Alert.alert("Sign Up Failed", message)
      throw new Error(message)
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
      Alert.alert("Update Failed", "Could not update profile.")
    }
  }, [user, userProfile])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      Alert.alert("Logged Out", "You have been logged out.")
    } catch (error) {
      console.error("Logout failed:", error)
      Alert.alert("Logout Error", "Could not log out.")
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAuthState = useCallback(() => {
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        logout,
        updateUserProfile,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
