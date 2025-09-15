"use client"

import { AuthState, getCurrentUser, signIn, signOut, signUp, User, UserRole } from "@/lib/auth"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: {
    email: string
    password: string
    name: string
    role: UserRole
    title?: string
    department?: string
    university?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth-token")
        if (token) {
          const user = await getCurrentUser(token)
          if (user) {
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true,
            })
            return
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("auth-token")
      }

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }

    initAuth()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      const { user, token } = await signIn(email, password)
      localStorage.setItem("auth-token", token)

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const handleSignUp = async (data: {
    email: string
    password: string
    name: string
    role: UserRole
    title?: string
    department?: string
    university?: string
  }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      const { user, token } = await signUp(data)
      localStorage.setItem("auth-token", token)

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const handleSignOut = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      await signOut()
      localStorage.removeItem("auth-token")

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error("Sign out error:", error)
      // Still clear local state even if API call fails
      localStorage.removeItem("auth-token")
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const updateUser = (updates: Partial<User>) => {
    setAuthState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }))
  }

  const value: AuthContextType = {
    ...authState,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
