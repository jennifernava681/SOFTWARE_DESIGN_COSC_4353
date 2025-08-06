import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import "../../../css/vet.css"

// Use apiFetch if available, fallback to native fetch
const getAnimals = async () => {
  try {
    const response = await fetch("/vet/animals", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("Error fetching animals:", err)
    return []
  }
}

const updateAdoptionStatus = async (animalId, status) => {
  try {
    const payload = { readyForAdoption: status }
    const response = await fetch(`/vet/animals/${animalId}`, {
      method: "PUT", // or "PATCH" if your API uses PATCH
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error("Failed to update status")
  } catch (err) {
    console.error("Error updating adoption status:", err)
    throw err
  }
}

export default function NewReadyStatusForm() {
  const navigate = useNavigate()
  const [updatedStatuses, setUpdatedStatuses] = useState([])
  const [availableAnimals, setAvailableAnimals] = useState([])
  const [formData, setFormData] = useState({
    animalId: "",
    readyForAdoption: "false",
  })

  useEffect(() => {
    getAnimals().then((animals) => {
      setAvailableAnimals(animals)
      if (animals.length > 0) {
        setFormData((prev) => ({ ...prev, animalId: animals[0].id.toString() }))
      }
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const selectedAnimal = availableAnimals.find((a) => a.id.toString() === formData.animalId)
    if (!selectedAnimal) {
      alert("Please select a valid animal.")
      return
    }

    const newStatus = formData.readyForAdoption === "true"
    const statusText = newStatus ? "Ready for Adoption" : "Not Ready Yet"

    try {
      await updateAdoptionStatus(formData.animalId, newStatus)

      const newUpdate = {
        id: Date.now() + Math.random(),
        animalName: selectedAnimal.name,
        oldStatus: selectedAnimal.readyForAdoption ? "Ready for Adoption" : "Not Ready Yet",
        newStatus: statusText,
        date: new Date().toISOString().split("T")[0],
      }

      setUpdatedStatuses((prev) => [newUpdate, ...prev])
      setAvailableAnimals((prev) =>
        prev.map((animal) =>
          animal.id.toString() === formData.animalId
            ? { ...animal, readyForAdoption: newStatus }
            : animal
        )
      )

      alert(`Status for ${selectedAnimal.name} updated to ${statusText}!`)
      setFormData((prev) => ({ ...prev, readyForAdoption: "false" }))
    } catch (error) {
      alert("Error updating status. Please try again.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-light">
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-6 flex justify-end">
          <Link
            to="/vetdashboard"
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-base font-semibold"
          >
            <ArrowLeft className="h-5 w-5" /> Volver al Dashboard
          </Link>
        </div>
        <div className="task-container">
          <div className="task-header">
            <h1 className="task-title">Update Adoption Status</h1>
            <p className="task-subtitle">Manage the adoption readiness of animals</p>
          </div>
          <div className="task-grid">
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">
                  <CheckCircle className="icon" />
                  Update Status
                </h2>
                <p className="card-description">Select an animal and update its adoption status.</p>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="animalId" className="form-label">
                      Select Animal
                    </label>
                    <select
                      id="animalId"
                      name="animalId"
                      className="form-select"
                      value={formData.animalId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select an animal</option>
                      {availableAnimals.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {animal.name} ({animal.type} - {animal.breed}) - Current:{" "}
                          {animal.readyForAdoption ? "Ready" : "Not Ready"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="readyForAdoption" className="form-label">
                      Ready for Adoption
                    </label>
                    <select
                      id="readyForAdoption"
                      name="readyForAdoption"
                      className="form-select"
                      value={formData.readyForAdoption}
                      onChange={handleChange}
                      required
                    >
                      <option value="true">Yes, Ready for Adoption</option>
                      <option value="false">No, Not Ready Yet</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>

            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">Recent Status Updates</h2>
                <p className="card-description">
                  {updatedStatuses.length} update{updatedStatuses.length !== 1 ? "s" : ""} recorded
                </p>
              </div>
              <div className="card-content">
                <div className="task-list">
                  {updatedStatuses.length === 0 ? (
                    <div className="empty-state">
                      <p>No status updates yet. Update an animal's status using the form.</p>
                    </div>
                  ) : (
                    updatedStatuses.map((update) => (
                      <div key={update.id} className="task-item">
                        <div className="task-item-header">
                          <h3 className="task-item-title">Status for {update.animalName}</h3>
                          <span
                            className={`badge ${
                              update.newStatus === "Ready for Adoption"
                                ? "badge-priority-low"
                                : "badge-priority-high"
                            }`}
                          >
                            {update.newStatus}
                          </span>
                        </div>
                        <p className="task-item-description">
                          Changed from: {update.oldStatus} to: {update.newStatus}
                        </p>
                        <div className="task-separator"></div>
                        <div className="task-item-meta">
                          <div className="task-item-meta-item">{update.date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
