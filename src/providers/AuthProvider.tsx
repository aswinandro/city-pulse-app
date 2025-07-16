"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "@/services/firebase"
import { StorageService } from "@/services/StorageService"
import type { UserProfile } from "@/types/User"

interface AuthContextType {
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
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await loadUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [loadUserProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        // Load the user profile if it's not already loaded or if it's a new sign-in
        const currentProfile = userProfile || (await StorageService.getUserData<UserProfile>(userCredential.user.uid))

        if (currentProfile) {
          const updatedProfile: UserProfile = {
            ...currentProfile,
            lastLoginAt: new Date().toISOString(),
          }
          await StorageService.setUserData(userCredential.user.uid, updatedProfile)
          setUserProfile(updatedProfile)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Sign in failed"
        throw new Error(errorMessage)
      }
    },
    [userProfile],
  )

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign up failed"
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
        throw error
      }
    },
    [user, userProfile],
  )

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed"
      throw new Error(errorMessage)
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
