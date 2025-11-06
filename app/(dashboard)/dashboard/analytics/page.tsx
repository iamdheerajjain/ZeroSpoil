"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useAnalytics } from "@/lib/hooks/use-analytics"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Leaf,
  Package,
  AlertTriangle
} from "lucide-react"

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30)
  const { analytics, loading } = useAnalytics(period)

  const periodOptions = [
    { value: 7, label: "Last 7 days" },
    { value: 30, label: "Last 30 days" },
    { value: 90, label: "Last 3 months" },
    { value: 365, label: "Last year" }
  ]

  const stats = [
    {
      title: "Total Items",
      value: analytics?.total_items || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Money Saved",
      value: `$${analytics?.money_saved?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "CO₂ Saved",
      value: `${analytics?.co2_saved?.toFixed(1) || '0.0'} kg`,
      icon: Leaf,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+15%",
      changeType: "positive"
    },
    {
      title: "Waste Prevented",
      value: analytics?.waste_prevented || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+5%",
      changeType: "positive"
    }
  ]

  if (loading) {
    return (
      <DashboardLayout title="Analytics" description="Track your food waste reduction progress">
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg border p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg border p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Analytics"
      description="Track your food waste reduction progress and environmental impact"
    >
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-end">
          <Select
            value={period.toString()}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="w-48"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.waste_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saved" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Items Saved"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wasted" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Items Wasted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="donated" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Items Donated"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Food Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.category_breakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics?.category_breakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Action Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Action Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.action_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analytics?.co2_saved?.toFixed(1) || '0.0'} kg
                  </div>
                  <p className="text-gray-600">CO₂ emissions prevented</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Equivalent to driving {((analytics?.co2_saved || 0) * 2.3).toFixed(0)} km less
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics?.meals_preserved || 0}
                  </div>
                  <p className="text-gray-600">Meals preserved</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Could feed a person for {Math.floor((analytics?.meals_preserved || 0) / 3)} days
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analytics?.donation_count || 0}
                  </div>
                  <p className="text-gray-600">Donations made</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Helping your local community
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">🎉 Great Job!</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• You've prevented {analytics?.waste_prevented || 0} items from being wasted</li>
                  <li>• Your efforts saved ${analytics?.money_saved?.toFixed(2) || '0.00'} this period</li>
                  <li>• You've reduced CO₂ emissions by {analytics?.co2_saved?.toFixed(1) || '0.0'} kg</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">💡 Tips to Improve</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Check expiring items daily to plan meals ahead</li>
                  <li>• Use our recipe suggestions to use ingredients creatively</li>
                  <li>• Consider donating items you won't use in time</li>
                  <li>• Learn preservation techniques to extend food life</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}