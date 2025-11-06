"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

interface OnboardingData {
  fullName?: string;
  household_size?: number;
  dietary_restrictions?: string[];
  favorite_cuisines?: string[];
  goals?: string[];
  completed_at?: string;
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [loading, setLoading] = useState(true);
  const { user, profile, updateProfile } = useAuth();

  useEffect(() => {
    if (user && profile !== undefined) {
      // Check if user has completed onboarding
      const hasCompletedOnboarding =
        profile?.onboarding_completed ||
        localStorage.getItem(`onboarding_completed_${user.id}`);

      setShowOnboarding(!hasCompletedOnboarding);
      setLoading(false);
    }
  }, [user, profile]);

  const completeOnboarding = async (data: OnboardingData) => {
    try {
      setLoading(true);

      // Update user profile with onboarding data
      if (updateProfile) {
        await updateProfile({
          full_name: data.fullName,
          dietary_restrictions: data.dietary_restrictions || [],
          favorite_cuisines: data.favorite_cuisines || [],
          onboarding_completed: true,
          // Add any other onboarding data
        });
      }

      // Also store in localStorage as backup
      if (user) {
        localStorage.setItem(`onboarding_completed_${user.id}`, "true");
        localStorage.setItem(
          `onboarding_data_${user.id}`,
          JSON.stringify({
            ...data,
            completed_at: new Date().toISOString(),
          })
        );
      }

      setOnboardingData(data);
      setShowOnboarding(false);

      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_skipped_${user.id}`, "true");
    }
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`onboarding_completed_${user.id}`);
      localStorage.removeItem(`onboarding_skipped_${user.id}`);
      localStorage.removeItem(`onboarding_data_${user.id}`);
    }
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    onboardingData,
    loading,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
