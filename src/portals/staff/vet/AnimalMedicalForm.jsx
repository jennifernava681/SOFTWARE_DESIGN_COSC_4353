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
    date: "",
    note: "",
    diagnoses: [],
    treatments: [],
  })
  const [availableAnimals, setAvailableAnimals] = useState([])

  const recordTypes = ["Vaccination", "Check-up", "Injury", "Medication", "Surgery", "Diagnosis", "Other"]
  const allDiagnoses = [
    "Allergies",
    "Parasites", 
    "Dental Issues",
    "Respiratory Infection",
    "Arthritis",
    "Obesity",
    "Skin Condition",
  ]
  const allTreatments = [
    "Antibiotics",
    "Pain Medication", 
    "Dietary Change",
    "Surgery",
    "Vaccine",
    "Physical Therapy",
    "Topical Cream",
  ]

  function getAnimals() {
    return apiFetch("/api/vets/animals", "GET")
      .then(data => Array.isArray(data) ? data : [])
      .catch(error => {
        console.error("Error fetching animals:", error)
        throw error
      })
  }

  function getMedicalRecords() {
    return apiFetch("/api/vets/medical-records", "GET")
      .then(data => Array.isArray(data) ? data : [])
      .catch(error => {
        console.error("Error fetching medical records:", error)
        throw error
      })
  }

  function createMedicalRecord(recordData) {
    const payload = {
      record_type: recordData.recordType,
      record_date: recordData.date,
      created_at: new Date().toISOString(),
      note: recordData.note,
      ANIMALS_id_animal: recordData.animalId,
      USERS_id_user: 1,
      diagnoses: recordData.diagnoses,
      treatments: recordData.treatments,
    }
    
    return apiFetch("/api/vets/medical-records", "POST", payload)
      .catch(error => {
        console.error("Error creating medical record:", error)
        throw error
      })
  }

  function loadInitialData() {
    Promise.all([getAnimals(), getMedicalRecords()])
      .then(results => {
        const animals = results[0]
        const records = results[1]
        
        setAvailableAnimals(animals)
        setMedicalRecords(records)
        
        if (animals.length > 0) {
          setFormData(prev => ({ ...prev, animalId: animals[0].id.toString() }))
        }
      })
      .catch(error => {
        console.error('Error loading data:', error)
        const mockAnimals = [
          { id: 1, name: "Buddy", type: "Dog", breed: "Golden Retriever" },
          { id: 2, name: "Whiskers", type: "Cat", breed: "Siamese Mix" },
          { id: 3, name: "Rex", type: "Dog", breed: "German Shepherd" },
          { id: 4, name: "Polly", type: "Bird", breed: "Parrot" },
          { id: 5, name: "Slither", type: "Reptile", breed: "Ball Python" },
        ]
        setAvailableAnimals(mockAnimals)
        if (mockAnimals.length > 0) {
          setFormData(prev => ({ ...prev, animalId: mockAnimals[0].id.toString() }))
        }
      })
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleMultiSelectChange(e, fieldName) {
    const selectedValue = e.target.value
    if (selectedValue && !formData[fieldName].includes(selectedValue)) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], selectedValue],
      }))
      e.target.value = ""
    }
  }

  function removeMultiSelectItem(itemToRemove, fieldName) {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(item => item !== itemToRemove),
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.animalId || !formData.recordType || !formData.date || !formData.note) {
      alert("Please fill in all required fields.")
      return
    }

    setLoading(true)
    
    const selectedAnimal = availableAnimals.find(a => a.id.toString() === formData.animalId)
    if (!selectedAnimal) {
      alert("Please select an animal.")
      setLoading(false)
      return
    }

    const recordData = {
      animalId: parseInt(formData.animalId),
      recordType: formData.recordType,
      date: formData.date,
      note: formData.note,
      diagnoses: formData.diagnoses,
      treatments: formData.treatments,
    }

    createMedicalRecord(recordData)
      .then(() => {
        return getMedicalRecords()
      })
      .then(updatedRecords => {
        setMedicalRecords(updatedRecords)
        setFormData(prev => ({
          ...prev,
          recordType: "",
          date: "",
          note: "",
          diagnoses: [],
          treatments: [],
        }))
        alert("Medical record added successfully!")
      })
      .catch(error => {
        console.error('Error creating medical record:', error)
        alert("Error creating medical record. Please try again.")
      })
      .finally(() => {
        setLoading(false)
      })
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
            <h1 className="task-title">Add New Medical Record</h1>
            <p className="task-subtitle">Create and manage medical records for animals</p>
          </div>
          
          <div className="task-grid">
            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">
                  <Stethoscope className="icon" />
                  New Record Details
                </h2>
                <p className="card-description">Fill out the details to add a new medical record.</p>
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
                          {animal.name} ({animal.type} - {animal.breed})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="recordType" className="form-label">
                      Record Type
                    </label>
                    <select
                      id="recordType"
                      name="recordType"
                      className="form-select"
                      value={formData.recordType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select record type</option>
                      {recordTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        name="date"
                        className="form-input"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="note" className="form-label">
                      Notes
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      className="form-textarea"
                      placeholder="Detailed notes about the medical record..."
                      value={formData.note}
                      onChange={handleChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diagnoses</label>
                    <div className="skills-container">
                      {formData.diagnoses.map((diagnosis) => (
                        <span
                          key={diagnosis}
                          className="badge badge-secondary badge-removable"
                          onClick={() => removeMultiSelectItem(diagnosis, "diagnoses")}
                          title="Click to remove"
                        >
                          {diagnosis} ×
                        </span>
                      ))}
                    </div>
                    <select
                      className="form-select"
                      onChange={(e) => handleMultiSelectChange(e, "diagnoses")}
                      value=""
                    >
                      <option value="">Add diagnoses</option>
                      {allDiagnoses
                        .filter((diag) => !formData.diagnoses.includes(diag))
                        .map((diag) => (
                          <option key={diag} value={diag}>
                            {diag}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Treatments</label>
                    <div className="skills-container">
                      {formData.treatments.map((treatment) => (
                        <span
                          key={treatment}
                          className="badge badge-secondary badge-removable"
                          onClick={() => removeMultiSelectItem(treatment, "treatments")}
                          title="Click to remove"
                        >
                          {treatment} ×
                        </span>
                      ))}
                    </div>
                    <select
                      className="form-select"
                      onChange={(e) => handleMultiSelectChange(e, "treatments")}
                      value=""
                    >
                      <option value="">Add treatments</option>
                      {allTreatments
                        .filter((treat) => !formData.treatments.includes(treat))
                        .map((treat) => (
                          <option key={treat} value={treat}>
                            {treat}
                          </option>
                        ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? "Adding Record..." : "Add Medical Record"}
                  </button>
                </form>
              </div>
            </div>

            <div className="task-card">
              <div className="card-header">
                <h2 className="card-title">Recent Medical Records</h2>
                <p className="card-description">
                  {medicalRecords.length} record{medicalRecords.length !== 1 ? "s" : ""} added
                </p>
              </div>
              
              <div className="card-content">
                <div className="task-list">
                  {medicalRecords.length === 0 ? (
                    <div className="empty-state">
                      <p>No medical records added yet. Add your first record using the form.</p>
                    </div>
                  ) : (
                    medicalRecords.map((record) => (
                      <div key={record.id_record || record.id} className="task-item">
                        <div className="task-item-header">
                          <h3 className="task-item-title">
                            {record.record_type || record.recordType} for {record.animal_name || record.animalName}
                          </h3>
                        </div>
                        <p className="task-item-description">{record.note}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          {record.diagnoses && record.diagnoses.map((diag) => (
                            <span key={diag} className="badge badge-secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {diag}
                            </span>
                          ))}
                          {record.treatments && record.treatments.map((treat) => (
                            <span key={treat} className="badge badge-secondary">
                              <Plus className="h-3 w-3 mr-1" />
                              {treat}
                            </span>
                          ))}
                        </div>
                        <div className="task-separator"></div>
                        <div className="task-item-meta">
                          <div className="task-item-meta-item">
                            <Calendar className="icon-sm" />
                            {record.record_date || record.date}
                          </div>
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

export default NewMedicalRecordForm
