import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Stethoscope, Calendar, Tag, ArrowLeft } from 'lucide-react'
import "../../../css/vet.css"
import { apiFetch } from "../../../api"

function NewMedicalRecordForm() {
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    animalId: "",
    recordType: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
    diagnoses: [],
    treatments: [],
  })
  const [availableAnimals, setAvailableAnimals] = useState([])

  const recordTypes = ["Vaccination", "Check-up", "Injury", "Medication", "Surgery", "Diagnosis", "Other"]
  const allDiagnoses = ["Allergies", "Parasites", "Dental Issues", "Respiratory Infection", "Arthritis", "Obesity", "Skin Condition"]
  const allTreatments = ["Antibiotics", "Pain Medication", "Dietary Change", "Surgery", "Vaccine", "Physical Therapy", "Topical Cream"]

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

  const getMedicalRecords = () => {
    return apiFetch("/api/vets/medical-records", "GET")
      .then(data => Array.isArray(data) ? data : [])
      .catch(err => {
        console.error("Error fetching medical records:", err)
        throw err
      })
  }

  const createMedicalRecord = (record) => {
    const payload = {
      record_type: record.recordType,
      record_date: record.date,
      created_at: new Date().toISOString(),
      note: record.note,
      ANIMALS_id_animal: record.animalId,
      USERS_id_user: 1, // TODO: Replace with logged-in vet ID
      diagnoses: record.diagnoses,
      treatments: record.treatments,
    }

    return apiFetch("/api/vets/medical-records", "POST", payload)
  }

  const loadData = () => {
    Promise.all([getAnimals(), getMedicalRecords()])
      .then(([animals, records]) => {
        setAvailableAnimals(animals)
        setMedicalRecords(records)
        if (animals.length > 0) {
          setFormData(prev => ({ ...prev, animalId: animals[0].id.toString() }))
        }
      })
      .catch(error => {
        console.error("❌ Failed to load data:", error)
        alert("Error loading animals or records.")
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (e, fieldName) => {
    const value = e.target.value
    if (value && !formData[fieldName].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], value]
      }))
    }
    e.target.value = ""
  }

  const removeMultiSelectItem = (item, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(i => i !== item)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.animalId || !formData.recordType || !formData.date || !formData.note) {
      alert("Please fill in all required fields.")
      return
    }

    setLoading(true)

    const recordData = {
      animalId: parseInt(formData.animalId),
      recordType: formData.recordType,
      date: formData.date,
      note: formData.note,
      diagnoses: formData.diagnoses,
      treatments: formData.treatments,
    }

    createMedicalRecord(recordData)
      .then(() => getMedicalRecords())
      .then(updated => {
        setMedicalRecords(updated)
        setFormData(prev => ({
          ...prev,
          recordType: "",
          date: new Date().toISOString().split("T")[0],
          note: "",
          diagnoses: [],
          treatments: [],
        }))
        alert("✅ Medical record added!")
      })
      .catch(err => {
        console.error("Error creating record:", err)
        alert("❌ Error adding record.")
      })
      .finally(() => setLoading(false))
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
            <h1 className="task-title">Add Medical Record</h1>
            <p className="task-subtitle">Track medical care for animals</p>
          </div>

          <div className="task-grid">
            {/* Form Card */}
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title"><Stethoscope className="icon" /> Record Details</h2>
              </div>

              <div className="card-content">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Animal</label>
                    <select
                      name="animalId"
                      className="form-select"
                      value={formData.animalId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {availableAnimals.map(animal => (
                        <option key={animal.id} value={animal.id}>
                          {animal.name} ({animal.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Record Type</label>
                    <select
                      name="recordType"
                      className="form-select"
                      value={formData.recordType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {recordTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      name="date"
                      className="form-input"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="note"
                      className="form-textarea"
                      rows={3}
                      value={formData.note}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diagnoses</label>
                    <div className="skills-container">
                      {formData.diagnoses.map(d => (
                        <span key={d} className="badge badge-secondary badge-removable" onClick={() => removeMultiSelectItem(d, "diagnoses")}>{d} ×</span>
                      ))}
                    </div>
                    <select onChange={(e) => handleMultiSelectChange(e, "diagnoses")} className="form-select" value="">
                      <option value="">Add Diagnosis</option>
                      {allDiagnoses.filter(d => !formData.diagnoses.includes(d)).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Treatments</label>
                    <div className="skills-container">
                      {formData.treatments.map(t => (
                        <span key={t} className="badge badge-secondary badge-removable" onClick={() => removeMultiSelectItem(t, "treatments")}>{t} ×</span>
                      ))}
                    </div>
                    <select onChange={(e) => handleMultiSelectChange(e, "treatments")} className="form-select" value="">
                      <option value="">Add Treatment</option>
                      {allTreatments.filter(t => !formData.treatments.includes(t)).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? "Saving..." : "Add Medical Record"}
                  </button>
                </form>
              </div>
            </div>

            {/* Records Card */}
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">Recent Records</h2>
              </div>
              <div className="card-content">
                <div className="task-list">
                  {medicalRecords.length === 0 ? (
                    <div className="empty-state">No records yet.</div>
                  ) : (
                    medicalRecords.map((rec) => (
                      <div key={rec.id_record || rec.id} className="task-item">
                        <div className="task-item-header">
                          <h3 className="task-item-title">{rec.record_type} for {rec.animal_name}</h3>
                        </div>
                        <p className="task-item-description">{rec.note}</p>
                        <div className="task-item-meta">
                          <Calendar className="icon-sm" /> {rec.record_date}
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

export default NewMedicalRecordForm
