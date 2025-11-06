"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Package,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { cn, getStatusColor, formatRelativeDate } from "@/lib/utils"

// Mock data - in real app, this would come from your API
const mockFoodItems = [
  {
    id: "1",
    name: "Organic Bananas",
    category: "Fruits",
    quantity: 6,
    unit: "pieces",
    storage_location: "Counter",
    expiration_date: "2024-10-05",
    status: "fresh" as const,
    image_url: null,
    purchase_date: "2024-10-01"
  },
  {
    id: "2",
    name: "Greek Yogurt",
    category: "Dairy",
    quantity: 1,
    unit: "container",
    storage_location: "Fridge",
    expiration_date: "2024-10-04",
    status: "expiring_soon" as const,
    image_url: null,
    purchase_date: "2024-09-28"
  },
  {
    id: "3",
    name: "Whole Wheat Bread",
    category: "Bakery",
    quantity: 1,
    unit: "loaf",
    storage_location: "Pantry",
    expiration_date: "2024-10-02",
    status: "expired" as const,
    image_url: null,
    purchase_date: "2024-09-25"
  },
  {
    id: "4",
    name: "Fresh Spinach",
    category: "Vegetables",
    quantity: 200,
    unit: "grams",
    storage_location: "Fridge",
    expiration_date: "2024-10-06",
    status: "fresh" as const,
    image_url: null,
    purchase_date: "2024-10-01"
  }
]

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "fresh" | "expiring_soon" | "expired">("all")

  const filteredItems = mockFoodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fresh":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "expiring_soon":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-danger" />
      default:
        return <Package className="h-4 w-4 text-gray-400" />
    }
  }

  const FoodItemCard = ({ item }: { item: typeof mockFoodItems[0] }) => (
    <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription>{item.category}</CardDescription>
          </div>
          <div className={cn("status-badge", getStatusColor(item.status))}>
            {getStatusIcon(item.status)}
            <span className="ml-1 capitalize">{item.status.replace("_", " ")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity:</span>
            <span>{item.quantity} {item.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location:</span>
            <span>{item.storage_location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Expires:</span>
            <span className={cn(
              item.status === "expired" ? "text-danger" :
              item.status === "expiring_soon" ? "text-yellow-600" :
              "text-gray-900"
            )}>
              {formatRelativeDate(item.expiration_date)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FoodItemRow = ({ item }: { item: typeof mockFoodItems[0] }) => (
    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category} • {item.storage_location}</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="font-medium">{item.quantity} {item.unit}</p>
          <p className="text-sm text-gray-500">Quantity</p>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-medium",
            item.status === "expired" ? "text-danger" :
            item.status === "expiring_soon" ? "text-yellow-600" :
            "text-gray-900"
          )}>
            {formatRelativeDate(item.expiration_date)}
          </p>
          <p className="text-sm text-gray-500">Expires</p>
        </div>
        <div className={cn("status-badge", getStatusColor(item.status))}>
          {getStatusIcon(item.status)}
          <span className="ml-1 capitalize">{item.status.replace("_", " ")}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
          <p className="mt-2 text-gray-600">Manage your food items and track expiration dates</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Food Item
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <div className="flex border border-gray-200 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "all", label: "All Items", count: mockFoodItems.length },
          { key: "fresh", label: "Fresh", count: mockFoodItems.filter(i => i.status === "fresh").length },
          { key: "expiring_soon", label: "Expiring Soon", count: mockFoodItems.filter(i => i.status === "expiring_soon").length },
          { key: "expired", label: "Expired", count: mockFoodItems.filter(i => i.status === "expired").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key as any)}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              filterStatus === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Food Items */}
      {filteredItems.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food items found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first food item to track its expiration"
              }
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Food Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredItems.map((item) => (
            viewMode === "grid" ? (
              <FoodItemCard key={item.id} item={item} />
            ) : (
              <FoodItemRow key={item.id} item={item} />
            )
          ))}
        </div>
      )}
    </div>
  )
}