"use client"
import { Link } from "react-router-dom"
import { Stethoscope, CheckCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import "../../../css/vet.css"
import { apiFetch } from "../../../api"

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

const updateAnimalStatus = async (animalId, status) => {
  try {
    console.log("Updating animal status:", animalId, status)
    const result = await apiFetch(`/api/vets/ready-status/${animalId}`, "PUT", { status })
    console.log("Update status success result:", result)
    return result
  } catch (error) {
    console.error("Error updating animal status:", error)
    throw error
  }
}

// Custom SVG Icons provided by the user (copied from HomePage example)
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

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
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
    readyForAdoption: animal.status?.toLowerCase() === "available",
    image: animal.photo_url,
    behavior: animal.note || animal.notes || "Behavior information not available",
    history: `In our care since ${animal.intake_date ? new Date(animal.intake_date).toLocaleDateString() : "unknown date"}. ${
      animal.note || "No additional history available."
    }`,
    socialnessLevel: animal.sex === "Male" ? "High" : animal.sex === "Female" ? "Medium" : "Unknown",
    status: animal.status,
    intake_date: animal.intake_date,
    sex: animal.sex,
  }
}

export default function VetDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString())
  const [animals, setAnimals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

      // Format animals for display
      const formattedAnimals = animalsData.map(formatAnimalForDisplay)

      setAnimals(formattedAnimals)
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

  const handleStatusUpdate = async (animalId) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [animalId]: true }))
      setError("")
      setSuccessMessage("")

      await updateAnimalStatus(animalId, "available")

      // Update local state
      setAnimals((prev) =>
        prev.map((animal) =>
          animal.id === animalId ? { ...animal, readyForAdoption: true, status: "available" } : animal,
        ),
      )

      setSuccessMessage(`✅ Animal status updated successfully!`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error updating animal status:", error)
      let errorMsg = "Failed to update animal status."

      if (error.message.includes("401") || error.message.includes("authentication")) {
        errorMsg = "Authentication required. You may need to log in as a veterinarian."
      } else if (error.message.includes("403")) {
        errorMsg = "You don't have permission to update animal status. Veterinarian role required."
      } else if (error.message.includes("404")) {
        errorMsg = "Animal not found."
      }

      setError(errorMsg)
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [animalId]: false }))
    }
  }

  return (
    <div className="full-width-wrapper bg-gradient-main">
      <main className="flex-1 p-6 md:p-10">
        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #16a34a",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#15803d",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #dc2626",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#dc2626",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Introduction Section - Styled to blend with the background and match section header text */}
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Welcome, <span className="hero-title-gradient">vet!</span>
              </h1>
              <p className="hero-description">
                We're glad to have you back in the system. You can view and update medical records, manage checkups, and
                ensure every animal stays healthy and ready for adoption. Thank you for taking care of our furry
                friends.
              </p>
              <div style={{ marginTop: "2rem" }}>
                <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                  Current time: {currentTime} | {animals.length} animals under care
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="animals" className="all-animals">
          <div className="all-animals-container">
            <div className="section-header-all">
              <h2 className="section-title-all">Animals Under Care</h2>
              <p className="section-description-all">
                Explore the profiles of animals currently under our care, including their behavior, history, and medical
                status.
              </p>
              <div className="section-divider-all" />
              <div className="section-divider-all" style={{ width: "4rem", marginTop: "1rem" }} />
            </div>

            {/* Refresh Button */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
              <button
                onClick={loadAnimals}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
                {isLoading ? "Loading..." : "Refresh Animals"}
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="empty-state" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
                <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>Loading animals under care...</p>
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
                  <strong>Unable to load animals</strong>
                </div>
                <p style={{ color: "#7f1d1d", marginBottom: "1.5rem" }}>{error}</p>
                <button
                  onClick={loadAnimals}
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
                  Try Again
                </button>
              </div>
            )}

            {/* No Animals State */}
            {!isLoading && !error && animals.length === 0 && (
              <div className="empty-state" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <PawIcon />
                <h4 style={{ color: "#374151", margin: "1rem 0", fontSize: "1.3rem" }}>No Animals Found</h4>
                <p style={{ color: "#6b7280", fontSize: "1rem" }}>
                  No animals are currently in the system. Check back later or contact administration.
                </p>
              </div>
            )}

            {/* Animals Grid */}
            {!isLoading && !error && animals.length > 0 && (
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
                        className="animal-image-all"
                        onError={(e) => {
                          e.target.src = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(
                            `cute ${animal.type.toLowerCase()}`,
                          )}`
                        }}
                      />
                      <div className={`animal-status-all ${animal.readyForAdoption ? "" : "not-ready"}`}>
                        {animal.readyForAdoption ? "Ready for Adoption" : "Not Ready Yet"}
                      </div>
                      <div className="animal-overlay-all" />
                    </div>
                    <div className="animal-content-all">
                      <h4 className="animal-name-all">{animal.name}</h4>
                      <p className="animal-details-all">
                        {animal.type} • {animal.breed} • {animal.age} • {animal.sex}
                      </p>
                      <p className="animal-description-all">{animal.behavior}</p>
                      <div className="grid gap-3 text-sm text-gray-text">
                        <div className="animal-info-item">
                          <PawIcon className="h-5 w-5 flex-shrink-0 text-blue-primary" />
                          <div>
                            <span className="label">Behavior:</span> {animal.behavior}
                          </div>
                        </div>
                        <div className="animal-info-item">
                          <CalendarIcon className="h-5 w-5 flex-shrink-0 text-blue-primary" />
                          <div>
                            <span className="label">History:</span> {animal.history}
                          </div>
                        </div>
                        <div className="animal-info-item">
                          <UsersIcon className="h-5 w-5 flex-shrink-0 text-blue-primary" />
                          <div>
                            <span className="label">Status:</span> {animal.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-6">
                        <Link to={`/animalMedicalForm?animalId=${animal.id}`} className="block">
                          <button className="btn-animal-all" style={{ marginBottom: "20px" }}>
                            <Stethoscope className="h-5 w-5 mr-2" />
                            <span>View Medical Records</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => handleStatusUpdate(animal.id)}
                          disabled={updatingStatus[animal.id] || animal.readyForAdoption}
                          className="btn-animal-all"
                          style={{
                            marginBottom: "20px",
                            backgroundColor: animal.readyForAdoption ? "#10b981" : "#2563eb",
                            opacity: updatingStatus[animal.id] ? 0.7 : 1,
                            cursor: updatingStatus[animal.id] || animal.readyForAdoption ? "not-allowed" : "pointer",
                          }}
                        >
                          {updatingStatus[animal.id] ? (
                            <>
                              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              <span>{animal.readyForAdoption ? "Ready for Adoption" : "Mark Ready for Adoption"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
