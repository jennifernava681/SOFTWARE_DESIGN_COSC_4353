"use client"
import { useState, useEffect } from "react"
import "../../../css/DonatePage.css"

// API Configuration
const API_BASE_URL = "https://hopepaws-api-hfbwhtazhsg4cjbb.centralus-01.azurewebsites.net/api"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  return token && token.length > 0
}

// Check if user is manager
const isManager = () => {
  return isAuthenticated()
}

// API Functions for donations (managers only)
const getAllDonations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in as a manager")
      }
      if (response.status === 403) {
        throw new Error("Forbidden: Manager access required")
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const donations = await response.json()
    return donations
  } catch (error) {
    console.error("Error fetching donations:", error)
    throw error
  }
}

const getDonationStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const stats = await response.json()
    return stats
  } catch (error) {
    console.error("Error fetching donation stats:", error)
    throw error
  }
}

// Calculate stats from donations data
const calculateStats = (donations) => {
  const totalDonations = donations.length
  const totalAmount = donations.reduce((sum, donation) => {
    const amount = typeof donation.amount === "string" ? Number.parseFloat(donation.amount) : donation.amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Get current month donations (July 2025 for the mock data)
  const currentMonth = 6 // July (0-indexed)
  const currentYear = 2025
  const monthlyDonations = donations.filter((donation) => {
    const donationDate = new Date(donation.donation_date)
    return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear
  }).length

  const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0

  return {
    total_donations: totalDonations,
    total_amount: totalAmount,
    monthly_donations: monthlyDonations,
    average_donation: averageDonation,
  }
}

// Prepare chart data
const prepareChartData = (donations) => {
  // Amount of money donated (only monetary donations)
  const moneyAmounts = {}
  donations.forEach((donation) => {
    if (donation.donation_type?.includes("money")) {
      const date = donation.donation_date
      const amount = typeof donation.amount === "string" ? Number.parseFloat(donation.amount) : donation.amount
      const displayDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      moneyAmounts[displayDate] = (moneyAmounts[displayDate] || 0) + (isNaN(amount) ? 0 : amount)
    }
  })

  // Types of donations (categorize by what they donated)
  const donationTypes = {}
  donations.forEach((donation) => {
    let category = "Other"

    if (donation.donation_type === "money") {
      category = "Money Only"
    } else if (donation.donation_type === "items") {
      // Categorize by items description
      const description = donation.items_description?.toLowerCase() || ""
      if (
        description.includes("food") ||
        description.includes("dog food") ||
        description.includes("cat food") ||
        description.includes("canned")
      ) {
        category = "Food"
      } else if (description.includes("toy") || description.includes("collar") || description.includes("leash")) {
        category = "Toys"
      } else if (description.includes("bed") || description.includes("blanket") || description.includes("litter")) {
        category = "Supplies"
      } else if (description.includes("medical") || description.includes("shampoo")) {
        category = "Medical"
      } else if (description.includes("seed")) {
        category = "Pet Food"
      } else {
        category = "Other Items"
      }
    } else if (donation.donation_type === "money and items") {
      category = "Mixed"
    }

    donationTypes[category] = (donationTypes[category] || 0) + 1
  })

  return { moneyAmounts, donationTypes }
}

// Simple Bar Chart Component
const BarChart = ({ data, title, color = "#3b82f6" }) => {
  const entries = Object.entries(data)
  const maxValue = Math.max(...Object.values(data))

  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600", color: "#374151" }}>{title}</h4>
        <p style={{ textAlign: "center", color: "#6b7280" }}>No data available</p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        minHeight: "300px",
      }}
    >
      <h4 style={{ marginBottom: "1.5rem", fontSize: "1.1rem", fontWeight: "600", color: "#374151" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "end", gap: "1rem", height: "200px", padding: "0 1rem" }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div
              style={{
                backgroundColor: color,
                width: "100%",
                maxWidth: "60px",
                height: `${Math.max((value / maxValue) * 150, 20)}px`,
                borderRadius: "4px 4px 0 0",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "start",
                justifyContent: "center",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "600",
                paddingTop: "0.25rem",
                position: "relative",
              }}
            >
              <span style={{ position: "absolute", top: "-20px", color: "#374151" }}>{value}</span>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                textAlign: "center",
                wordBreak: "break-word",
                color: "#6b7280",
                maxWidth: "80px",
                lineHeight: "1.2",
              }}
            >
              {key}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Line Chart Component
const LineChart = ({ data, title, color = "#10b981" }) => {
  const entries = Object.entries(data).sort(([a], [b]) => new Date(a) - new Date(b))
  const maxValue = Math.max(...Object.values(data))

  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600", color: "#374151" }}>{title}</h4>
        <p style={{ textAlign: "center", color: "#6b7280" }}>No data available</p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        minHeight: "300px",
      }}
    >
      <h4 style={{ marginBottom: "1.5rem", fontSize: "1.1rem", fontWeight: "600", color: "#374151" }}>{title}</h4>
      <div
        style={{
          position: "relative",
          height: "200px",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.25rem",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 200" style={{ overflow: "visible" }}>
          {entries.map(([date, amount], index) => {
            const x = (index / Math.max(entries.length - 1, 1)) * 350 + 25
            const y = 180 - (amount / maxValue) * 140
            const nextEntry = entries[index + 1]

            return (
              <g key={date}>
                <circle cx={x} cy={y} r="6" fill={color} stroke="white" strokeWidth="2" />
                <text x={x} y={y - 15} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="600">
                  ${amount}
                </text>
                {nextEntry && (
                  <line
                    x1={x}
                    y1={y}
                    x2={((index + 1) / Math.max(entries.length - 1, 1)) * 350 + 25}
                    y2={180 - (nextEntry[1] / maxValue) * 140}
                    stroke={color}
                    strokeWidth="3"
                  />
                )}
              </g>
            )
          })}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.5rem" }}>
          {entries.map(([date]) => (
            <span key={date} style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "500" }}>
              {date}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Icons Components
const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" />
  </svg>
)

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4M16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14M6 6C7.11 6 8 6.89 8 8S7.11 10 6 10 4 9.11 4 8 4.89 6 6 6M6 12C8.67 12 12 13.34 12 16V18H0V16C0 13.34 3.33 12 6 12Z" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
)

const AlertIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
  </svg>
)

function DonationReports() {
  const [donations, setDonations] = useState([])
  const [stats, setStats] = useState({
    total_donations: 0,
    total_amount: 0,
    monthly_donations: 0,
    average_donation: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [error, setError] = useState(null)
  const [chartData, setChartData] = useState({ moneyAmounts: {}, donationTypes: {} })

  // Load donations and calculate stats - ONLY FROM API
  const loadDonations = async () => {
    try {
      setLoading(true)
      setError(null)
      const authenticated = isAuthenticated()
      const managerAccess = isManager()

      setUserAuthenticated(authenticated)

      if (!authenticated || !managerAccess) {
        setError("Manager authentication required to view donation reports")
        setDonations([])
        setStats({
          total_donations: 0,
          total_amount: 0,
          monthly_donations: 0,
          average_donation: 0,
        })
        setChartData({ moneyAmounts: {}, donationTypes: {} })
        return
      }

      // Only try to load from API - no fallback data
      const donationsData = await getAllDonations()

      if (donationsData && Array.isArray(donationsData) && donationsData.length > 0) {
        setDonations(donationsData)
        const calculatedStats = calculateStats(donationsData)
        setStats(calculatedStats)
        const charts = prepareChartData(donationsData)
        setChartData(charts)
      } else {
        setError("No donations found in the database")
        setDonations([])
        setStats({
          total_donations: 0,
          total_amount: 0,
          monthly_donations: 0,
          average_donation: 0,
        })
        setChartData({ moneyAmounts: {}, donationTypes: {} })
      }
    } catch (err) {
      console.error("Error loading donations:", err)
      setError(err.message || "Failed to load donations from API")
      setDonations([])
      setStats({
        total_donations: 0,
        total_amount: 0,
        monthly_donations: 0,
        average_donation: 0,
      })
      setChartData({ moneyAmounts: {}, donationTypes: {} })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDonations()
  }, [])

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    if (filter === "all") return true
    return donation.donation_type?.toLowerCase().includes(filter.toLowerCase())
  })

  // Export to CSV
  const exportToCSV = () => {
    if (filteredDonations.length === 0) {
      alert("No data to export")
      return
    }

    const headers = ["ID", "Type", "Amount", "Date", "Items Description"]
    const csvContent = [
      headers.join(","),
      ...filteredDonations.map((donation) =>
        [
          donation.id,
          `"${donation.donation_type || "N/A"}"`,
          donation.amount || 0,
          donation.donation_date ? new Date(donation.donation_date).toLocaleDateString() : "N/A",
          `"${donation.items_description || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `donations-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRefresh = () => {
    loadDonations()
  }

  if (loading) {
    return (
      <div className="donations-report">
        <div className="donation-page-container">
          <div className="donation-content-wrapper">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span style={{ marginLeft: "1rem", fontSize: "1.1rem" }}>Loading donation reports from API...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="donations-report">
        <div className="donation-page-container">
          <div className="donation-content-wrapper">
            <div className="main-card">
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#dc2626",
                }}
              >
                <AlertIcon />
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#dc2626" }}>Error Loading Data</h3>
                <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>{error}</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <button
                    className="export-button"
                    onClick={handleRefresh}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      backgroundColor: "#3b82f6",
                    }}
                  >
                    <RefreshIcon />
                    Try Again
                  </button>
                  <button
                    className="back-button"
                    onClick={() => window.history.back()}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <ArrowLeftIcon />
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="donations-report">
      <div className="donation-page-container">
        <div className="donation-content-wrapper">
          {/* Header */}
          <div className="main-card">
            <div className="card-header donations-header">
              <div className="header-content">
                <h1 className="main-title">Donation Reports</h1>
                <p className="main-subtitle">
                  Track and manage all donations to Hope Paws Animal Shelter
                  <span style={{ marginLeft: "1rem", fontSize: "0.875rem", opacity: 0.7 }}>
                    (Live API Data - {donations.length} records)
                  </span>
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="form-content">
              <div
                className="stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <div className="stats-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <DollarIcon />
                  <h3 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0.5rem 0" }}>
                    $
                    {stats.total_amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                  <p style={{ margin: 0, fontSize: "1rem", opacity: 0.9 }}>Total Raised</p>
                </div>

                <div className="stats-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <UsersIcon />
                  <h3 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0.5rem 0" }}>{stats.total_donations}</h3>
                  <p style={{ margin: 0, fontSize: "1rem", opacity: 0.9 }}>Total Donations</p>
                </div>

                <div className="stats-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <CalendarIcon />
                  <h3 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0.5rem 0" }}>
                    {stats.monthly_donations}
                  </h3>
                  <p style={{ margin: 0, fontSize: "1rem", opacity: 0.9 }}>This Month</p>
                </div>

                <div className="stats-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <TrendingUpIcon />
                  <h3 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0.5rem 0" }}>
                    ${stats.average_donation.toFixed(2)}
                  </h3>
                  <p style={{ margin: 0, fontSize: "1rem", opacity: 0.9 }}>Average Donation</p>
                </div>
              </div>

              {/* Charts Section */}
              {donations.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#374151" }}>
                    📊 Analytics Dashboard
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                      gap: "2rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <LineChart data={chartData.moneyAmounts} title="💰 Money Donations Over Time ($)" color="#10b981" />
                    <BarChart data={chartData.donationTypes} title="📦 Types of Donations" color="#f59e0b" />
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
                      📈 Charts show donation patterns and categories based on live API data
                    </p>
                  </div>
                </div>
              )}

              {/* Filters and Export */}
              {donations.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div className="filter-buttons" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      className={`filter-button ${filter === "all" ? "active" : ""}`}
                      onClick={() => setFilter("all")}
                      style={{ padding: "0.75rem 1.5rem" }}
                    >
                      All Donations ({donations.length})
                    </button>
                    <button
                      className={`filter-button ${filter === "money" ? "active" : ""}`}
                      onClick={() => setFilter("money")}
                      style={{ padding: "0.75rem 1.5rem" }}
                    >
                      Money ({donations.filter((d) => d.donation_type?.includes("money")).length})
                    </button>
                    <button
                      className={`filter-button ${filter === "items" ? "active" : ""}`}
                      onClick={() => setFilter("items")}
                      style={{ padding: "0.75rem 1.5rem" }}
                    >
                      Items ({donations.filter((d) => d.donation_type === "items").length})
                    </button>
                    <button
                      className={`filter-button ${filter === "money and items" ? "active" : ""}`}
                      onClick={() => setFilter("money and items")}
                      style={{ padding: "0.75rem 1.5rem" }}
                    >
                      Mixed ({donations.filter((d) => d.donation_type === "money and items").length})
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      className="export-button"
                      onClick={exportToCSV}
                      disabled={filteredDonations.length === 0}
                      style={{
                        padding: "0.75rem 1.5rem",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        opacity: filteredDonations.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <DownloadIcon />
                      Export CSV
                    </button>

                    <button
                      className="export-button"
                      onClick={handleRefresh}
                      style={{
                        padding: "0.75rem 1.5rem",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: "#6b7280",
                      }}
                    >
                      <RefreshIcon />
                      Refresh
                    </button>

                    <button
                      className="back-button"
                      onClick={() => window.history.back()}
                      style={{
                        padding: "0.75rem 1.5rem",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <ArrowLeftIcon />
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Donations List */}
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                }}
              >
                {filteredDonations.map((donation) => (
                  <div key={donation.id} className="donation-card" style={{ padding: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <h4
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.2rem",
                            fontWeight: "700",
                            color: "#374151",
                          }}
                        >
                          Donation #{donation.id}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                          <span
                            className="donation-type-badge"
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "1rem",
                              fontSize: "0.875rem",
                              backgroundColor: donation.donation_type?.includes("money") ? "#dbeafe" : "#dcfce7",
                              color: donation.donation_type?.includes("money") ? "#1e40af" : "#166534",
                              textTransform: "capitalize",
                            }}
                          >
                            {donation.donation_type || "N/A"}
                          </span>
                          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            <CalendarIcon style={{ width: "16px", height: "16px", marginRight: "0.25rem" }} />
                            {donation.donation_date ? new Date(donation.donation_date).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        {donation.items_description && (
                          <p
                            style={{
                              margin: "0.5rem 0 0 0",
                              fontSize: "0.875rem",
                              color: "#6b7280",
                              fontStyle: "italic",
                            }}
                          >
                            "{donation.items_description}"
                          </p>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div className="donation-amount">
                          $
                          {typeof donation.amount === "string"
                            ? Number.parseFloat(donation.amount).toFixed(2)
                            : (donation.amount || 0).toFixed(2)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "#059669",
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        >
                          Completed
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDonations.length === 0 && donations.length > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "#6b7280",
                  }}
                >
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No donations found</h3>
                  <p>No donations match the current filter criteria.</p>
                </div>
              )}

              {donations.length === 0 && !error && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "#6b7280",
                  }}
                >
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No donations in database</h3>
                  <p>There are currently no donations recorded in the system.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationReports
