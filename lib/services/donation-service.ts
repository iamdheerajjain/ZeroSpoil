import { createClient } from "@/lib/supabase/client"
import { Donation, DonationLocation } from "@/types"

export class DonationService {
  private supabase = createClient()

  async getDonations(filters?: {
    status?: string
  }): Promise<Donation[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)

      const response = await fetch(`/api/donations?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch donations")
      }

      const result = await response.json()
      return result.data as Donation[]
    } catch (error) {
      console.error("Error fetching donations:", error)
      throw error
    }
  }

  async getDonation(id: string): Promise<Donation> {
    try {
      const response = await fetch(`/api/donations/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch donation")
      }

      const result = await response.json()
      return result.data as Donation
    } catch (error) {
      console.error("Error fetching donation:", error)
      throw error
    }
  }

  async createDonation(donation: Omit<Donation, 'id' | 'user_id' | 'created_at'>): Promise<Donation> {
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donation),
      })

      if (!response.ok) {
        throw new Error("Failed to create donation")
      }

      const result = await response.json()
      return result.data as Donation
    } catch (error) {
      console.error("Error creating donation:", error)
      throw error
    }
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation> {
    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update donation")
      }

      const result = await response.json()
      return result.data as Donation
    } catch (error) {
      console.error("Error updating donation:", error)
      throw error
    }
  }

  async deleteDonation(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete donation")
      }
    } catch (error) {
      console.error("Error deleting donation:", error)
      throw error
    }
  }

  async getDonationLocations(coordinates?: {
    lat: number
    lng: number
    radius?: number
  }): Promise<DonationLocation[]> {
    try {
      const params = new URLSearchParams()
      if (coordinates) {
        params.append("lat", coordinates.lat.toString())
        params.append("lng", coordinates.lng.toString())
        if (coordinates.radius) {
          params.append("radius", coordinates.radius.toString())
        }
      }

      const response = await fetch(`/api/donation-locations?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch donation locations")
      }

      const result = await response.json()
      return result.data as DonationLocation[]
    } catch (error) {
      console.error("Error fetching donation locations:", error)
      throw error
    }
  }

  async scheduleDonation(locationId: string, items: any[], scheduledDate: string, options?: {
    totalWeight?: number
    estimatedMeals?: number
    notes?: string
  }): Promise<Donation> {
    try {
      const donation = {
        location_id: locationId,
        scheduled_date: scheduledDate,
        items,
        total_weight: options?.totalWeight,
        estimated_meals: options?.estimatedMeals,
        notes: options?.notes,
        status: 'scheduled' as const
      }

      return await this.createDonation(donation)
    } catch (error) {
      console.error("Error scheduling donation:", error)
      throw error
    }
  }

  async completeDonation(id: string, actualWeight?: number, actualMeals?: number): Promise<Donation> {
    try {
      const updates: Partial<Donation> = {
        status: 'completed'
      }

      if (actualWeight !== undefined) {
        updates.total_weight = actualWeight
      }
      if (actualMeals !== undefined) {
        updates.estimated_meals = actualMeals
      }

      return await this.updateDonation(id, updates)
    } catch (error) {
      console.error("Error completing donation:", error)
      throw error
    }
  }

  async cancelDonation(id: string, reason?: string): Promise<Donation> {
    try {
      const updates: Partial<Donation> = {
        status: 'cancelled'
      }

      if (reason) {
        updates.notes = reason
      }

      return await this.updateDonation(id, updates)
    } catch (error) {
      console.error("Error cancelling donation:", error)
      throw error
    }
  }
}