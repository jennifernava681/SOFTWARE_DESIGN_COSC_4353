"use client"
import { useState, useEffect } from "react"
import "../../css/home.css"
import "../../css/MobileNav.css"
import { apiFetch } from "../../api"

// API Service Functions
const getAllAnimals = async () => {
  try {
    const data = await apiFetch("/api/animals", "GET")
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching animals:", error)
    throw error
  }
}

// Proper Paw Print Icon that matches the design
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    {/* Main paw pad */}
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    {/* Top left toe pad */}
    <circle cx="8" cy="10" r="1.5" />
    {/* Top center toe pad */}
    <circle cx="12" cy="8" r="1.5" />
    {/* Top right toe pad */}
    <circle cx="16" cy="10" r="1.5" />
    {/* Side toe pad */}
    <circle cx="18" cy="13" r="1.2" />
  </svg>
)

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" />
  </svg>
)

// Helper function to format animal data for display
const formatAnimalForDisplay = (animal) => {
  return {
    id: animal.id_animal,
    name: animal.name || "Unknown",
    type: animal.species || "Unknown",
    breed: animal.species || "Mixed Breed",
    age: animal.age ? `${animal.age} years` : "Unknown age",
    status: animal.status || "Available",
    image: animal.photo_url,
    description: animal.note || animal.notes || "A wonderful companion looking for a loving home",
    intake_date: animal.intake_date,
    sex: animal.sex,
  }
}

// Helper function to get status class for styling
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "status-available"
    case "adopted":
      return "status-adopted"
    case "pending":
      return "status-pending"
    case "medical":
      return "status-medical"
    case "foster":
      return "status-foster"
    default:
      return "status-available"
  }
}

function BrowseAnimals() {
  const [animals, setAnimals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)

  // Load animals from API
  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    try {
      setIsLoading(true)
      setError("")
      console.log("Loading animals from API...")

      const animalsData = await getAllAnimals()
      console.log("Loaded animals:", animalsData)

      // Format animals for display and filter only available ones for public view
      const formattedAnimals = animalsData
        .map(formatAnimalForDisplay)
        .filter((animal) => animal.status.toLowerCase() === "available")

      setAnimals(formattedAnimals)
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error loading animals:", error)
      let errorMsg = "Unable to load animals at the moment."

      if (error.message.includes("Failed to fetch")) {
        errorMsg = "Cannot connect to server. Please check your internet connection."
      } else if (error.message.includes("404")) {
        errorMsg = "Animal data not found. Please try again later."
      } else if (error.message.includes("500")) {
        errorMsg = "Server error. Please try again later."
      }

      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    loadAnimals()
  }

  return (
    <div className="full-width-wrapper bg-gradient-main">
      {/* Featured Animals */}
      <section id="animals" className="all-animals">
        <div className="all-animals-container">
          <div className="section-header-all">
            <h3 className="section-title-all">Meet Our Friends</h3>
            <p className="section-description-all">
              These beautiful souls are waiting for their forever families. Each one has been lovingly cared for and is
              ready to bring joy to your home.
            </p>
            <div className="section-divider-all"></div>
          </div>

          {/* Refresh Button */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <RefreshIcon />
              {isLoading ? "Loading..." : "Refresh Animals"}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="empty-state" style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>Loading our wonderful animals...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                padding: "2rem",
                textAlign: "center",
                margin: "2rem 0",
              }}
            >
              <div style={{ color: "#dc2626", fontSize: "1.1rem", marginBottom: "1rem" }}>
                <strong>Oops! Something went wrong</strong>
              </div>
              <p style={{ color: "#7f1d1d", marginBottom: "1.5rem" }}>{error}</p>
              <button
                onClick={handleRetry}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Try Again {retryCount > 0 && `(${retryCount})`}
              </button>
            </div>
          )}

          {/* No Animals State */}
          {!isLoading && !error && animals.length === 0 && (
            <div className="empty-state" style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <PawIcon />
              <h4 style={{ color: "#374151", margin: "1rem 0", fontSize: "1.3rem" }}>No Animals Available</h4>
              <p style={{ color: "#6b7280", fontSize: "1rem" }}>
                All our animals have found their forever homes! Check back soon for new arrivals.
              </p>
            </div>
          )}

          {/* Animals Grid */}
          {!isLoading && !error && animals.length > 0 && (
            <>
              <div className="all-animals-grid">
                {animals.map((animal) => (
                  <div key={animal.id} className="animal-card-all">
                    <div className="animal-image-container-all">
                      <img
                        src={
                          animal.image ||
                          `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(
                            `cute ${animal.type.toLowerCase() || "/placeholder.svg"} ${animal.breed}`,
                          )}`
                        }
                        alt={animal.name}
                        className="animal-image"
                        onError={(e) => {
                          e.target.src = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(
                            `cute ${animal.type.toLowerCase()}`,
                          )}`
                        }}
                      />
                      <div className={`animal-status-all ${getStatusClass(animal.status)}`}>{animal.status}</div>
                      <div className="animal-overlay-all"></div>
                    </div>
                    <div className="animal-content-all">
                      <h4 className="animal-name-all">{animal.name}</h4>
                      <p className="animal-details-all">
                        {animal.breed} • {animal.age} • {animal.sex}
                      </p>
                      <p className="animal-description-all">{animal.description}</p>
                      {animal.intake_date && (
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>
                          In our care since: {new Date(animal.intake_date).toLocaleDateString()}
                        </p>
                      )}
                      <button className="btn-animal-all">
                        <HeartIcon />
                        <span style={{ marginLeft: "0.5rem" }}>Learn More About {animal.name}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Animals Count */}
              <div style={{ textAlign: "center", marginTop: "2rem", color: "#6b7280" }}>
                <p>
                  Showing {animals.length} available {animals.length === 1 ? "animal" : "animals"} looking for homes
                </p>
              </div>
            </>
          )}

          {/* Uncomment if you want to add a "View All" button */}
          {/*
          <div className="view-btn-all">
            <button className="btn-all-view">View All Available Animals</button>
          </div>
          */}
        </div>
      </section>
    </div>
  )
}

export default BrowseAnimals
