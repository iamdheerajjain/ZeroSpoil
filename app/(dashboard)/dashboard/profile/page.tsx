"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { DIETARY_TAGS, CUISINE_TYPES } from "@/lib/constants"
import { User, Settings, Bell, Globe } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, profile, updateProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: profile || {
      full_name: user?.user_metadata?.full_name || '',
      dietary_restrictions: [],
      favorite_cuisines: [],
      measurement_system: 'metric',
      business_account: false,
      theme: 'light',
      notification_settings: {
        expiration_alerts: true,
        recipe_suggestions: true,
        donation_reminders: true,
        achievement_notifications: true,
        email_notifications: false
      }
    }
  })

  const watchedDietaryRestrictions = watch('dietary_restrictions') || []
  const watchedFavoriteCuisines = watch('favorite_cuisines') || []

  const onSubmit = async (data: UserProfileFormData) => {
    try {
      setIsLoading(true)
      await updateProfile(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset(profile || {})
    setIsEditing(false)
  }

  const toggleDietaryRestriction = (restriction: string) => {
    const current = watchedDietaryRestrictions
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction]
    setValue('dietary_restrictions', updated)
  }

  const toggleFavoriteCuisine = (cuisine: string) => {
    const current = watchedFavoriteCuisines
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine]
    setValue('favorite_cuisines', updated)
  }

  return (
    <DashboardLayout
      title="Profile"
      description="Manage your account settings and preferences"
      action={!isEditing ? {
        label: "Edit Profile",
        onClick: () => setIsEditing(true)
      } : undefined}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    {...register('full_name')}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Measurement System
                  </label>
                  <Select
                    {...register('measurement_system')}
                    disabled={!isEditing}
                  >
                    <option value="metric">Metric (kg, liters)</option>
                    <option value="imperial">Imperial (lbs, gallons)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <Select
                    {...register('business_account', { 
                      setValueAs: (value) => value === 'true' 
                    })}
                    disabled={!isEditing}
                  >
                    <option value="false">Personal Account</option>
                    <option value="true">Business Account</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={watchedDietaryRestrictions.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${!isEditing ? 'pointer-events-none' : ''}`}
                      onClick={() => isEditing && toggleDietaryRestriction(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Cuisines
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_TYPES.slice(0, 10).map(cuisine => (
                    <Badge
                      key={cuisine}
                      variant={watchedFavoriteCuisines.includes(cuisine) ? "default" : "outline"}
                      className={`cursor-pointer ${!isEditing ? 'pointer-events-none' : ''}`}
                      onClick={() => isEditing && toggleFavoriteCuisine(cuisine)}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Expiration Alerts</p>
                    <p className="text-sm text-gray-600">Get notified when items are about to expire</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notification_settings.expiration_alerts')}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Recipe Suggestions</p>
                    <p className="text-sm text-gray-600">Receive personalized recipe recommendations</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notification_settings.recipe_suggestions')}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Donation Reminders</p>
                    <p className="text-sm text-gray-600">Reminders about scheduled donations</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notification_settings.donation_reminders')}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Achievement Notifications</p>
                    <p className="text-sm text-gray-600">Celebrate your waste reduction milestones</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notification_settings.achievement_notifications')}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notification_settings.email_notifications')}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isEditing && (
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {new Date(user?.created_at || Date.now()).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? 'Today' 
                    : Math.floor((Date.now() - new Date(user?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(user?.created_at || Date.now()).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? 'Member since' 
                    : 'Days as member'
                  }
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">0</div>
                <div className="text-sm text-gray-600">Items tracked</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">$0.00</div>
                <div className="text-sm text-gray-600">Money saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}