"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { apiClient } from "@/lib/api-client"
import { UserPreferences } from "@/types"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface AuthContextType {
  user: User | null
  profile: UserPreferences | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserPreferences>) => Promise<UserPreferences>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const currentUser = await apiClient.auth.getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        const userProfile = await apiClient.auth.getUserProfile()
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const result = await apiClient.auth.signUp(email, password, fullName)
      if (result.data?.user) {
        setUser(result.data.user)
        // Fetch profile after signup
        try {
          const userProfile = await apiClient.auth.getUserProfile()
          setProfile(userProfile)
        } catch (profileError) {
          console.error("Error fetching profile after signup:", profileError)
        }
      }
      return result
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiClient.auth.signIn(email, password)
      if (result.data?.user) {
        setUser(result.data.user)
        // Fetch profile after signin
        try {
          const userProfile = await apiClient.auth.getUserProfile()
          setProfile(userProfile)
        } catch (profileError) {
          console.error("Error fetching profile after signin:", profileError)
        }
      }
      return result
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await apiClient.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserPreferences>) => {
    try {
      const updatedProfile = await apiClient.auth.updateUserProfile(updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      return await apiClient.auth.resetPassword(email)
    } catch (error) {
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      return await apiClient.auth.updatePassword(newPassword)
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetchUser()

    // Listen for auth state changes
    let subscription: any = null
    
    try {
      const authStateChange = apiClient.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user)
            try {
              const userProfile = await apiClient.auth.getUserProfile()
              setProfile(userProfile)
            } catch (error) {
              console.error("Error fetching profile:", error)
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setProfile(null)
          }
        }
      )
      
      if (authStateChange?.data?.subscription) {
        subscription = authStateChange.data.subscription
      }
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [])

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword
  }
}

export { AuthContext }