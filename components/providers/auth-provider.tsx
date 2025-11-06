"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  created_at?: string
}

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      setUser(user)
      
      if (user) {
        // Try to fetch profile
        try {
          const response = await fetch("/api/profile")
          if (response.ok) {
            const result = await response.json()
            setProfile(result.data)
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)
        }
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sign up")
      }

      const result = await response.json()
      if (result.data?.user) {
        setUser(result.data.user)
      }
      return result
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sign in")
      }

      const result = await response.json()
      if (result.data?.user) {
        setUser(result.data.user)
        // Refresh the page to get the updated session
        window.location.reload()
      }
      return result
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      setUser(null)
      setProfile(null)
      window.location.href = "/"
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const result = await response.json()
      setProfile(result.data)
      return result.data
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { message: "Password reset email sent" }
    } catch (error) {
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return { message: "Password updated successfully" }
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetchUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          fetchUser() // Refetch to get profile
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}