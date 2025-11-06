import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "10" // Default 10km radius

    let query = supabase
      .from("donation_locations")
      .select("*")
      .eq("is_active", true)
      .order("name")

    // If coordinates provided, we could add distance filtering here
    // For now, return all active locations
    const { data: locations, error } = await query

    if (error) {
      console.error("Error fetching donation locations:", error)
      return NextResponse.json({ error: "Failed to fetch donation locations" }, { status: 500 })
    }

    // If coordinates provided, calculate distances and sort by proximity
    let processedLocations = locations
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const maxRadius = parseFloat(radius)

      processedLocations = locations
        .map(location => {
          const distance = calculateDistance(
            userLat, 
            userLng, 
            location.latitude, 
            location.longitude
          )
          return { ...location, distance }
        })
        .filter(location => location.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance)
    }

    return NextResponse.json({ data: processedLocations })
  } catch (error) {
    console.error("Error fetching donation locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}