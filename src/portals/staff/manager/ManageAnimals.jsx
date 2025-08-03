"use client"
import "../../../css/manageanimals.css"
import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
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

const createAnimal = async (animalData) => {
  try {
    console.log("Creating animal with data:", animalData)
    const result = await apiFetch("/api/animals", "POST", animalData)
    console.log("Create success result:", result)
    return result
  } catch (error) {
    console.error("Error creating animal:", error)
    throw error
  }
}

const updateAnimal = async (id, animalData) => {
  try {
    console.log("Updating animal ID:", id, "with data:", animalData)
    const result = await apiFetch(`/api/animals/${id}`, "PUT", animalData)
    console.log("Update success result:", result)
    return result
  } catch (error) {
    console.error("Error updating animal:", error)
    throw error
  }
}

const deleteAnimal = async (id) => {
  try {
    console.log("Deleting animal ID:", id)
    const result = await apiFetch(`/api/animals/${id}`, "DELETE")
    console.log("Delete success result:", result)
    return result
  } catch (error) {
    console.error("Error deleting animal:", error)
    throw error
  }
}

// Main Component
function ManageAnimals() {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    age: "",
    status: "",
    intake_date: "",
    photo_url: "",
    sex: "",
    note: "",
    notes: "",
    donation_date: "",
    surrender_requests_USERS_id_user: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [animals, setAnimals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true)

  // Load animals from API
  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    try {
      setIsLoadingAnimals(true)
      const animalsData = await getAllAnimals()
      console.log("Loaded animals:", animalsData)
      setAnimals(animalsData)
      setErrorMessage("")
    } catch (error) {
      console.error("Error loading animals:", error)
      let errorMsg = "Failed to load animals. Please try again."

      if (error.message.includes("Failed to fetch")) {
        errorMsg = "Cannot connect to server. Please check your internet connection."
      } else if (error.message.includes("404")) {
        errorMsg = "API endpoint not found. Please check the server configuration."
      } else if (error.message.includes("500")) {
        errorMsg = "Server error. Please try again later."
      }

      setErrorMessage(errorMsg)
      setShowErrorMessage(true)
      setTimeout(() => setShowErrorMessage(false), 8000)
    } finally {
      setIsLoadingAnimals(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photo_url: event.target?.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Prepare data for API - asegurándonos de que los campos coincidan exactamente con tu API
      const apiData = {
        name: formData.name.trim(),
        species: formData.species,
        age: Number.parseInt(formData.age),
        status: formData.status,
        intake_date: formData.intake_date,
        photo_url: formData.photo_url || null,
        sex: formData.sex,
        note: formData.note?.trim() || null,
        notes: formData.notes?.trim() || null,
        donation_date: formData.donation_date || null,
        surrender_requests_USERS_id_user: formData.surrender_requests_USERS_id_user
          ? Number.parseInt(formData.surrender_requests_USERS_id_user)
          : null,
      }

      console.log("Submitting form data:", apiData)
      console.log("Editing animal:", editingAnimal)

      if (editingAnimal) {
        // Update existing animal
        console.log("Updating animal with ID:", editingAnimal.id_animal)
        await updateAnimal(editingAnimal.id_animal, apiData)
        setEditingAnimal(null)
        console.log("Animal updated successfully")
      } else {
        // Create new animal
        console.log("Creating new animal")
        await createAnimal(apiData)
        console.log("Animal created successfully")
      }

      // Reload animals to get updated data
      await loadAnimals()

      setShowSuccessMessage(true)
      setShowForm(false)
      resetForm()
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      let errorMsg = "Failed to save animal. Please try again."

      if (error.message.includes("401") || error.message.includes("authentication")) {
        errorMsg = "Authentication required. You may need to log in first."
      } else if (error.message.includes("403")) {
        errorMsg = "You don't have permission to perform this action."
      } else if (error.message.includes("400")) {
        errorMsg = "Invalid data provided. Please check your input and try again."
      } else if (error.message.includes("422")) {
        errorMsg = "Validation error. Please check all required fields."
      }

      setErrorMessage(errorMsg)
      setShowErrorMessage(true)
      setTimeout(() => setShowErrorMessage(false), 8000)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      species: "",
      age: "",
      status: "",
      intake_date: "",
      photo_url: "",
      sex: "",
      note: "",
      notes: "",
      donation_date: "",
      surrender_requests_USERS_id_user: "",
    })
  }

  const handleEdit = (animal) => {
    console.log("Editing animal:", animal)

    // Formatear la fecha correctamente para el input date
    const formatDateForInput = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    }

    setFormData({
      name: animal.name || "",
      species: animal.species || "",
      age: animal.age?.toString() || "",
      status: animal.status || "",
      intake_date: formatDateForInput(animal.intake_date),
      photo_url: animal.photo_url || "",
      sex: animal.sex || "",
      note: animal.note || "",
      notes: animal.notes || "",
      donation_date: formatDateForInput(animal.donation_date),
      surrender_requests_USERS_id_user: animal.surrender_requests_USERS_id_user?.toString() || "",
    })
    setEditingAnimal(animal)
    setShowForm(true)
  }

  const handleDelete = async (animalId) => {
    if (window.confirm("Are you sure you want to delete this animal record?")) {
      try {
        await deleteAnimal(animalId)
        // Remove from local state immediately for better UX
        setAnimals((prev) => prev.filter((animal) => animal.id_animal !== animalId))
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
      } catch (error) {
        console.error("Error deleting animal:", error)
        let errorMsg = "Failed to delete animal. Please try again."

        if (error.message.includes("401") || error.message.includes("authentication")) {
          errorMsg = "Authentication required. You may need to log in first."
        } else if (error.message.includes("403")) {
          errorMsg = "You don't have permission to delete this animal."
        } else if (error.message.includes("404")) {
          errorMsg = "Animal not found. It may have been already deleted."
        }

        setErrorMessage(errorMsg)
        setShowErrorMessage(true)
        setTimeout(() => setShowErrorMessage(false), 8000)

        // Reload animals in case of error to sync with server
        await loadAnimals()
      }
    }
  }

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

  // Función temporal para testing - puedes eliminarla después
  const handleTestAuth = () => {
    localStorage.setItem("authToken", "test-token-for-development")
    console.log("Test token set for development")
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="notification-overlay">
          <div className="notification-banner floating show">
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Animal {editingAnimal ? "updated" : "added"} successfully!
          </div>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div className="notification-overlay">
          <div className="notification-banner floating show" style={{ backgroundColor: "#ef4444" }}>
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="animals">
        <div className="animals-container">
          <div className="section-header">
            <h2 className="section-title">Manage Animals</h2>
            <p className="section-description">Add, edit, and manage animal records in the system</p>
            <div className="section-divider"></div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", gap: "1rem" }}>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingAnimal(null)
                resetForm()
              }}
              className="btn-cta btn-cta-primary"
            >
              {showForm ? "Cancel" : "Add New Animal"}
            </button>
            <button onClick={loadAnimals} className="btn-cta" disabled={isLoadingAnimals}>
              {isLoadingAnimals ? "Loading..." : "Refresh"}
            </button>
            {/* Botón temporal para testing - puedes eliminarlo después */}
            
          </div>

          {/* Add/Edit Animal Form */}
          {showForm && (
            <div className="main-card" style={{ marginBottom: "3rem" }}>
              <div className="form-content">
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "2rem",
                    textAlign: "center",
                  }}
                >
                  {editingAnimal ? "Edit Animal" : "Add New Animal"}
                </h3>
                <form className="donation-form" onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Animal Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter animal name"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="species" className="form-label">
                        Species *
                      </label>
                      <select
                        id="species"
                        name="species"
                        value={formData.species}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select Species</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="age" className="form-label">
                        Age (years) *
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter age"
                        min="0"
                        max="30"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="sex" className="form-label">
                        Sex *
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="status" className="form-label">
                        Status *
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select Status</option>
                        <option value="available">Available</option>
                        <option value="adopted">Adopted</option>
                        <option value="surrendered">Surrendered</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="intake_date" className="form-label">
                        Intake Date *
                      </label>
                      <input
                        type="date"
                        id="intake_date"
                        name="intake_date"
                        value={formData.intake_date}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="form-group">
                    <label htmlFor="photo_file" className="form-label">
                      Animal Photo
                    </label>
                    <input
                      type="file"
                      id="photo_file"
                      name="photo_file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="form-input"
                    />
                    {formData.photo_url && (
                      <div style={{ marginTop: "1rem" }}>
                        <img
                          src={formData.photo_url || "/placeholder.svg"}
                          alt="Preview"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "2px solid #e2e8f0",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label htmlFor="note" className="form-label">
                      Description/Notes
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="Enter animal description, behavior notes, medical info, etc."
                      className="form-textarea"
                      rows={4}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes" className="form-label">
                      Additional Notes
                    </label>
                    <input
                      type="text"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Brief additional notes (max 45 characters)"
                      maxLength={45}
                      className="form-input"
                    />
                  </div>

                  {/* Optional Fields */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="donation_date" className="form-label">
                        Donation Date
                      </label>
                      <input
                        type="date"
                        id="donation_date"
                        name="donation_date"
                        value={formData.donation_date}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="surrender_requests_USERS_id_user" className="form-label">
                        Surrender User ID
                      </label>
                      <input
                        type="number"
                        id="surrender_requests_USERS_id_user"
                        name="surrender_requests_USERS_id_user"
                        value={formData.surrender_requests_USERS_id_user}
                        onChange={handleChange}
                        placeholder="Enter user ID if applicable"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="submit-button-wrapper">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`submit-button ${isLoading ? "loading" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner"></div>
                          {editingAnimal ? "Updating..." : "Adding..."}
                        </>
                      ) : editingAnimal ? (
                        "Update Animal"
                      ) : (
                        "Add Animal"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Animals List */}
          <div className="main-card">
            <div className="form-content">
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "2rem",
                  textAlign: "center",
                }}
              >
                Current Animals ({animals.length})
              </h3>

              {isLoadingAnimals ? (
                <div className="empty-state">
                  <div className="loading-spinner"></div>
                  <p>Loading animals...</p>
                </div>
              ) : animals.length === 0 ? (
                <div className="empty-state">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>No animals in the system yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {animals.map((animal) => (
                    <div key={animal.id_animal} className="animal-card">
                      {/* Animal Photo */}
                      <div className="animal-photo">
                        {animal.photo_url ? (
                          <img src={animal.photo_url || "/placeholder.svg"} alt={animal.name} />
                        ) : (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Animal Info */}
                      <div className="animal-info">
                        <div className="animal-header">
                          <h4 className="animal-name">{animal.name}</h4>
                          <span className={`status-badge ${getStatusClass(animal.status)}`}>{animal.status}</span>
                        </div>
                        <div className="animal-details">
                          <span>
                            <strong>Species:</strong> {animal.species}
                          </span>
                          <span>
                            <strong>Age:</strong> {animal.age} years
                          </span>
                          <span>
                            <strong>Sex:</strong> {animal.sex}
                          </span>
                          <span>
                            <strong>Intake:</strong> {animal.intake_date}
                          </span>
                        </div>
                        {animal.note && <p className="animal-note">{animal.note}</p>}
                      </div>

                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(animal)} className="action-btn edit-btn" title="Edit Animal">
                          <Plus className="icon" />
                        </button>
                        <button
                          onClick={() => handleDelete(animal.id_animal)}
                          className="action-btn delete-btn"
                          title="Delete Animal"
                        >
                          <X className="icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ManageAnimals
