import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import "../../../css/vet.css"
import { apiFetch } from "../../../api"

const formatAnimalForDisplay = (animal) => ({
  id: animal.id_animal || animal.id,
  name: animal.name || "Unknown",
  type: animal.species || "Unknown",
  status: animal.status?.toLowerCase() || "surrendered",
})

const getAnimals = async () => {
  try {
    const data = await apiFetch("/api/animals", "GET")
    return Array.isArray(data) ? data.map(formatAnimalForDisplay) : []
  } catch (err) {
    console.error("Error fetching animals:", err)
    return []
  }
}

const updateAdoptionStatus = async (animalId, newStatus) => {
  try {
    const payload = { status: newStatus }
    const response = await apiFetch(`/api/vets/ready-status/${animalId}`, "PUT", payload)
    return response
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
    status: "surrendered",
  })

  useEffect(() => {
    getAnimals().then((animals) => {
      setAvailableAnimals(animals)
      if (animals.length > 0) {
        setFormData((prev) => ({
          ...prev,
          animalId: animals[0].id.toString(),
          status: animals[0].status || "surrendered",
        }))
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

    try {
      await updateAdoptionStatus(formData.animalId, formData.status)

      const newUpdate = {
        id: Date.now() + Math.random(),
        animalName: selectedAnimal.name,
        oldStatus: selectedAnimal.status,
        newStatus: formData.status,
        date: new Date().toISOString().split("T")[0],
      }

      setUpdatedStatuses((prev) => [newUpdate, ...prev])

      setAvailableAnimals((prev) =>
        prev.map((animal) =>
          animal.id.toString() === formData.animalId
            ? { ...animal, status: formData.status }
            : animal
        )
      )

      alert(`Status for ${selectedAnimal.name} updated to ${formData.status}!`)
    } catch (error) {
      alert("Error updating status. Please try again.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-light">
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-6 flex justify-end">
          <Link to="/vetdashboard" className="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-base font-semibold">
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Link>
        </div>

        <div className="task-container">
          <div className="task-header">
            <h1 className="task-title">Update Adoption Status</h1>
            <p className="task-subtitle">Set animal status: available, adopted, or surrendered</p>
          </div>

          <div className="task-grid">
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">
                  <CheckCircle className="icon" />
                  Update Status
                </h2>
                <p className="card-description">Select an animal and set their adoption status.</p>
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
                          {animal.name} ({animal.type} - {animal.breed}) — {animal.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="adopted">Adopted</option>
                      <option value="surrendered">Surrendered</option>
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
                      <p>No updates yet. Submit a change to see it listed here.</p>
                    </div>
                  ) : (
                    updatedStatuses.map((update) => (
                      <div key={update.id} className="task-item">
                        <div className="task-item-header">
                          <h3 className="task-item-title">Status for {update.animalName}</h3>
                          <span className={`badge badge-priority-${update.newStatus === "available" ? "low" : "high"}`}>
                            {update.newStatus}
                          </span>
                        </div>
                        <p className="task-item-description">
                          Changed from: {update.oldStatus} → {update.newStatus}
                        </p>
                        <div className="task-item-meta">
                          <div className="task-item-meta-item">{update.date}</div>
                        </div>
                        <div className="task-separator"></div>
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
