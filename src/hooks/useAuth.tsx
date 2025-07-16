"use client"

import { useContext } from "react"
import { AuthContext, type AuthContextType } from "@/providers/AuthProvider" // Corrected import and added type import

export const useAuth = (): AuthContextType => {
  // Explicitly type the return
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
