"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Alert } from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "../services/firebase";
import { StorageService } from "../services/StorageService";
import type { UserProfile } from "../types/User";

export interface AuthContextType {
  readonly user: User | null;
  readonly userProfile: UserProfile | null;
  readonly loading: boolean;
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly updateUserProfile: (
    updates: Partial<UserProfile>
  ) => Promise<void>;
  readonly checkAuthState: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustLoginThisSession, setMustLoginThisSession] = useState(true);
  const router = useRouter();

  // Sign out on fresh app launch to force login screen every session
  useEffect(() => {
    const resetSession = async () => {
      try {
        console.log("🔒 Signing out user on fresh app launch...");
        await signOut(auth);
        setMustLoginThisSession(true);
      } catch (error) {
        console.error("❌ Error during reset:", error);
      }
    };
    resetSession();
  }, []);

  const loadUserProfile = useCallback(async (uid: string) => {
    try {
      const profile = await StorageService.getUserData<UserProfile>(uid);
      if (profile) {
        setUserProfile(profile);
        console.log("✅ User profile loaded:", profile.displayName);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      Alert.alert("Error", "Failed to load user profile. Please try again.");
    }
  }, []);

  useEffect(() => {
    let isMounted = true; // To avoid state update after unmount
    let initialAuthCheckDone = false;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      console.log("🔄 Auth state changed:", firebaseUser?.email ?? "null");

      try {
        if (firebaseUser && !mustLoginThisSession) {
          setUser(firebaseUser);
          await loadUserProfile(firebaseUser.uid);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error during auth state processing:", error);
      } finally {
        if (!initialAuthCheckDone) {
          setLoading(false);
          initialAuthCheckDone = true;
          console.log("✅ Auth initialization completed, loading=false");
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadUserProfile, mustLoginThisSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setMustLoginThisSession(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to sign in. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("user-not-found")) {
          errorMessage = "No account found with this email address.";
        } else if (error.message.includes("wrong-password")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes("too-many-requests")) {
          errorMessage = "Too many failed attempts. Try again later.";
        }
      }

      Alert.alert("Sign In Failed", errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

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
        };

        await StorageService.setUserData(user.uid, newUserProfile);
        setUserProfile(newUserProfile);
        setMustLoginThisSession(false);
        Alert.alert("Welcome!", `Account created for ${displayName}!`);
      } catch (error: unknown) {
        let errorMessage = "Failed to create account.";

        if (error instanceof Error) {
          if (error.message.includes("email-already-in-use")) {
            errorMessage = "Email already in use.";
          } else if (error.message.includes("weak-password")) {
            errorMessage = "Password should be at least 6 characters.";
          } else if (error.message.includes("invalid-email")) {
            errorMessage = "Invalid email address.";
          }
        }

        Alert.alert("Sign Up Failed", errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user || !userProfile) return;
      try {
        const updatedProfile: UserProfile = { ...userProfile, ...updates };
        await StorageService.setUserData(user.uid, updatedProfile);
        setUserProfile(updatedProfile);
      } catch (error) {
        console.error("Error updating user profile:", error);
        Alert.alert("Update Failed", "Could not update profile.");
        throw error;
      }
    },
    [user, userProfile]
  );

  const logout = useCallback(async () => {
  try {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setMustLoginThisSession(true);
    setLoading(false); // Reset loading after logout completes
    console.log("Inside the Logout")
    // Optionally redirect to login:
    // router.replace("/auth");
  } catch (error: unknown) {
    setLoading(false); // Also reset loading on error
    const errorMessage = error instanceof Error ? error.message : "Logout failed";
    Alert.alert("Logout Failed", errorMessage);
    throw new Error(errorMessage);
  }
}, []);


  const checkAuthState = useCallback(() => {
    if (user === null && !loading) {
      setLoading(false);
    }
  }, [user, loading]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
