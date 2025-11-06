"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationSchema, type DonationFormData } from "@/lib/validations";
import { apiClient } from "@/lib/api-client";
import {
  Heart,
  MapPin,
  Calendar,
  Phone,
  Clock,
  Plus,
  Package,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [donationLocations, setDonationLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Tomorrow
      items: [{ name: "", quantity: 1, unit: "pieces" }],
    },
  });

  const watchedItems = watch("items");

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load donations
      const donationsResponse = await fetch(
        `/api/donations?${
          statusFilter !== "all" ? `status=${statusFilter}` : ""
        }`
      );
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setDonations(donationsData.data || []);
      }

      // Load donation locations
      const locationsResponse = await fetch("/api/donation-locations");
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        setDonationLocations(locationsData.data || []);
      }
    } catch (error) {
      console.error("Error loading donations data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DonationFormData) => {
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowScheduleForm(false);
        reset();
        loadData();
      }
    } catch (error) {
      console.error("Error scheduling donation:", error);
    }
  };

  const addItem = () => {
    const currentItems = watchedItems || [];
    reset({
      ...watch(),
      items: [...currentItems, { name: "", quantity: 1, unit: "pieces" }],
    });
  };

  const removeItem = (index: number) => {
    const currentItems = watchedItems || [];
    reset({
      ...watch(),
      items: currentItems.filter((_, i) => i !== index),
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (statusFilter === "all") return true;
    return donation.status === statusFilter;
  });

  return (
    <DashboardLayout
      title="Donations"
      description="Schedule food donations and connect with local organizations"
      action={{
        label: "Schedule Donation",
        onClick: () => setShowScheduleForm(true),
      }}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Donations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {donations.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {donations.filter((d) => d.status === "completed").length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-50">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Estimated Meals
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {donations.reduce(
                      (total, d) => total + (d.estimated_meals || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by status:
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">All Donations</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg border p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {donations.length === 0
                  ? "No donations yet"
                  : "No donations match your filter"}
              </h3>
              <p className="text-gray-600 mb-6">
                {donations.length === 0
                  ? "Start making a difference by scheduling your first food donation."
                  : "Try changing the status filter to see more donations."}
              </p>
              {donations.length === 0 && (
                <Button onClick={() => setShowScheduleForm(true)}>
                  Schedule Your First Donation
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredDonations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {donation.donation_locations?.name ||
                              "Unknown Location"}
                          </h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="mr-1 h-4 w-4" />
                            {donation.donation_locations?.address ||
                              "Address not available"}
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(donation.status)}>
                          {donation.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(donation.scheduled_date)}
                        </div>

                        {donation.donation_locations?.contact_phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="mr-2 h-4 w-4" />
                            {donation.donation_locations.contact_phone}
                          </div>
                        )}

                        {donation.estimated_meals && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="mr-2 h-4 w-4" />~
                            {donation.estimated_meals} meals
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      {donation.items && donation.items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Items to donate:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {donation.items.map((item: any, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {item.quantity} {item.unit} {item.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {donation.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {donation.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Scheduled {formatDate(donation.created_at)}
                        </div>

                        {donation.status === "scheduled" && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Donation Locations */}
        {donationLocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Nearby Donation Centers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donationLocations.slice(0, 6).map((location) => (
                  <div key={location.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {location.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="mr-1 h-3 w-3" />
                      {location.address}
                    </div>
                    {location.contact_phone && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Phone className="mr-1 h-3 w-3" />
                        {location.contact_phone}
                      </div>
                    )}
                    {location.hours && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Open today
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Schedule Donation Form */}
      <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0 p-0">
          <DialogHeader className="relative pb-6 px-6 pt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl text-white shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Schedule Food Donation
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Help reduce food waste by donating to those in need
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Location */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Donation Location
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Location *
                </label>
                <div className="relative">
                  <div className="relative">
                    <Select 
                      {...register("location_id")}
                      className="h-12 text-base border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-lg transition-all duration-200 hover:border-gray-300 appearance-none w-full"
                    >
                      <option value="" className="text-gray-500">
                        Select a donation center
                      </option>
                      {donationLocations.map((location) => (
                        <option key={location.id} value={location.id} className="py-2">
                          {location.name} - {location.address}
                        </option>
                      ))}
                    </Select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                {errors.location_id && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.location_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Donation Date
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Scheduled Date *
                </label>
                <Input
                  type="date"
                  {...register("scheduled_date")}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-12 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                />
                {errors.scheduled_date && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.scheduled_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Items to Donate */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Items to Donate
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="flex items-center border-2 border-blue-200 hover:bg-blue-50 text-blue-700"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {watchedItems?.map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Item Name
                      </label>
                      <Input
                        {...register(`items.${index}.name` as const)}
                        placeholder="e.g., Apples, Bread, Milk"
                        className="h-10 text-sm border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="1.0"
                        className="h-10 text-sm border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <div className="relative">
                        <Select 
                          {...register(`items.${index}.unit` as const)}
                          className="h-10 text-sm border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg appearance-none w-full"
                        >
                          <option value="pieces">pieces</option>
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                          <option value="packages">packages</option>
                          <option value="cans">cans</option>
                          <option value="bottles">bottles</option>
                        </Select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      {watchedItems && watchedItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Total Weight (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("total_weight", { valueAsNumber: true })}
                    placeholder="Optional"
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Estimated Meals
                  </label>
                  <Input
                    type="number"
                    min="0"
                    {...register("estimated_meals", { valueAsNumber: true })}
                    placeholder="Optional"
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Notes
                </label>
                <Textarea
                  {...register("notes")}
                  placeholder="Any special instructions or notes for the donation center..."
                  rows={3}
                  className="w-full text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200 hover:border-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScheduleForm(false)}
                className="flex-1 h-12 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 rounded-lg"
              >
                <Heart className="h-5 w-5 mr-2" />
                Schedule Donation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
