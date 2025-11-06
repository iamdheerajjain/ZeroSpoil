import { createClient } from "@/lib/supabase/client"
import { UserPreferences } from "@/types"

export class AuthService {
  private supabase = createClient()

  async signUp(email: string, password: string, fullName?: string) {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sign up")
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  async signIn(email: string, password: string) {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sign in")
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  async signOut() {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sign out")
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error) {
        throw error
      }

      return user
    } catch (error) {
      console.error("Error getting current user:", error)
      throw error
    }
  }

  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error) {
        throw error
      }

      return session
    } catch (error) {
      console.error("Error getting session:", error)
      throw error
    }
  }

  async getUserProfile() {
    try {
      const response = await fetch("/api/profile")

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }
  }

  async updateUserProfile(updates: Partial<UserPreferences>) {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update user profile")
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      return { message: "Password reset email sent" }
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return { message: "Password updated successfully" }
    } catch (error) {
      console.error("Error updating password:", error)
      throw error
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    try {
      return this.supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error("Error setting up auth state change listener:", error)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }
}