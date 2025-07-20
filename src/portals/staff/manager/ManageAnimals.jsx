"use client"
import "../../../css/manageanimals.css"
import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react" // Añade esta línea
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
    surrender_user_id: "",
    surrender_address_id: "",
    surrender_state_id: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [animals, setAnimals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  // Mock data for existing animals
  useEffect(() => {
    // Simulate loading existing animals
    setAnimals([
      {
        id_animal: 1,
        name: "Buddy",
        species: "Dog",
        age: 3,
        status: "Available",
        intake_date: "2024-01-15",
        sex: "Male",
        note: "Friendly and energetic dog, great with children and other pets.",
        photo_url: "/placeholder.svg?height=60&width=60",
      },
      {
        id_animal: 2,
        name: "Whiskers",
        species: "Cat",
        age: 2,
        status: "Available",
        intake_date: "2024-01-20",
        sex: "Female",
        note: "Calm and affectionate cat, loves to cuddle and purr.",
        photo_url: "/placeholder.svg?height=60&width=60",
      },
      {
        id_animal: 3,
        name: "Max",
        species: "Dog",
        age: 5,
        status: "Adopted",
        intake_date: "2024-01-10",
        sex: "Male",
        note: "Great with kids, well-trained and house-broken.",
        photo_url: "/placeholder.svg?height=60&width=60",
      },
    ])
  }, [])
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photo_url: event.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      if (editingAnimal) {
        // Update existing animal
        setAnimals((prev) =>
          prev.map((animal) =>
            animal.id_animal === editingAnimal.id_animal ? { ...formData, id_animal: editingAnimal.id_animal } : animal,
          ),
        )
        setEditingAnimal(null)
      } else {
        // Add new animal
        const newAnimal = {
          ...formData,
          id_animal: animals.length + 1,
          age: Number.parseInt(formData.age),
        }
        setAnimals((prev) => [...prev, newAnimal])
      }
      setIsLoading(false)
      setShowSuccessMessage(true)
      setShowForm(false)
      resetForm()
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }, 2000)
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
      surrender_user_id: "",
      surrender_address_id: "",
      surrender_state_id: "",
    })
  }
  const handleEdit = (animal) => {
    setFormData({
      name: animal.name || "",
      species: animal.species || "",
      age: animal.age?.toString() || "",
      status: animal.status || "",
      intake_date: animal.intake_date || "",
      photo_url: animal.photo_url || "",
      sex: animal.sex || "",
      note: animal.note || "",
      notes: animal.notes || "",
      donation_date: animal.donation_date || "",
      surrender_user_id: animal.surrender_user_id || "",
      surrender_address_id: animal.surrender_address_id || "",
      surrender_state_id: animal.surrender_state_id || "",
    })
    setEditingAnimal(animal)
    setShowForm(true)
  }
  const handleDelete = (animalId) => {
    if (window.confirm("Are you sure you want to delete this animal record?")) {
      setAnimals((prev) => prev.filter((animal) => animal.id_animal !== animalId))
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
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Adopted">Adopted</option>
                        <option value="Medical">Medical Care</option>
                        <option value="Foster">In Foster</option>
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
                      rows="4"
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
                      maxLength="45"
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
                      <label htmlFor="surrender_user_id" className="form-label">
                        Surrender User ID
                      </label>
                      <input
                        type="number"
                        id="surrender_user_id"
                        name="surrender_user_id"
                        value={formData.surrender_user_id}
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
              {animals.length === 0 ? (
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
                          <Plus className="icon" /> {/* Reemplazado el SVG con el icono Plus */}
                        </button>
                        <button
                          onClick={() => handleDelete(animal.id_animal)}
                          className="action-btn delete-btn"
                          title="Delete Animal"
                        >
                          <X className="icon" /> {/* Reemplazado el SVG con el icono X */}
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
