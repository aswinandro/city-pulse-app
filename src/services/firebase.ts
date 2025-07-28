import { initializeApp } from "firebase/app"
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  Auth,
} from "firebase/auth"

// ✅ Firebase config (read from `.env`)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const

// ✅ Validate environment variables
const requiredEnvVars = Object.entries(firebaseConfig)
for (const [key, value] of requiredEnvVars) {
  if (!value) {
    console.warn(`⚠️ Missing Firebase environment variable: ${key}`)
  }
}

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig)

// ✅ Initialize Auth using in-memory persistence (ideal for temporary sessions)
let auth: Auth

try {
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
  })
} catch (error: any) {
  if (error?.code === "auth/already-initialized") {
    console.log("ℹ️ Auth already initialized, using getAuth()")
    auth = getAuth(app)
  } else {
    console.error("❌ Firebase auth initialization error:", error)
    throw error
  }
}

// ✅ Export the auth and app
export { auth }
export default app
