"use client"
import { useState, useEffect } from "react"
import { Users, Trash2, AlertCircle } from "lucide-react"
import NotificationBanner from "../../../NotificationBanner.jsx"
import "../../../css/volunterout.css"

function RemoveVolunteer() {
  const [volunteers, setVolunteers] = useState([])
  const [isLoading, setIsLoading] = useState(true) // Cambio: iniciar en true
  const [deletingId, setDeletingId] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")
  const [bannerType, setBannerType] = useState("success") // Nuevo: tipo de banner
  const [error, setError] = useState(null) // Nuevo: manejo de errores

  useEffect(() => {
    let timer
    if (showBanner) {
      timer = setTimeout(() => setShowBanner(false), 3000)
    }
    return () => clearTimeout(timer)
  }, [showBanner])

  // Función para mostrar notificaciones
  const showNotification = (message, type = "success") => {
    setBannerMessage(message)
    setBannerType(type)
    setShowBanner(true)
  }

  // ✅ Fetch active volunteers with better error handling
  useEffect(() => {
    const fetchVolunteers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/deactivate/volunteers/active/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized - please login again")
          }
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        // Validar que data es un array
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server")
        }

        setVolunteers(data)
      } catch (error) {
        console.error("Error fetching volunteers:", error)
        setError(error.message)
        showNotification(`Error loading volunteers: ${error.message}`, "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVolunteers()
  }, [])

  // ✅ Deactivate volunteer with better error handling
  const handleDelete = async (volunteerId, volunteerName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${volunteerName}?`)) {
      return
    }

    setDeletingId(volunteerId)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/deactivate/volunteers/${volunteerId}/deactivate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`)
      }

      const responseData = await res.json()

      // Remover el voluntario de la lista local
      setVolunteers((prev) => prev.filter((v) => v.id_user !== volunteerId))

      showNotification(responseData.message || `Volunteer "${volunteerName}" deactivated successfully!`, "success")
    } catch (err) {
      console.error("Error deactivating volunteer:", err)
      showNotification(`Failed to deactivate volunteer: ${err.message}`, "error")
    } finally {
      setDeletingId(null)
    }
  }

  // Función para reintentar la carga
  const retryFetch = () => {
    window.location.reload() // Simple reload, o puedes llamar fetchVolunteers directamente
  }

  if (error && volunteers.length === 0) {
    return (
      <div className="volunteer-page-container">
        <div className="volunteer-main-card">
          <div className="error-state">
            <AlertCircle className="error-icon" size={48} />
            <h3>Error Loading Volunteers</h3>
            <p>{error}</p>
            <button onClick={retryFetch} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="volunteer-page-container">
      <NotificationBanner
        message={bannerMessage}
        floating
        show={showBanner}
        type={bannerType}
        onClose={() => setShowBanner(false)}
      />

      <div className="volunteer-main-card">
        <div className="volunteer-list-header">
          <h2 className="volunteer-list-title">
            <Users className="header-icon" />
            Current Volunteers ({volunteers.length})
          </h2>
          <p className="volunteer-list-description">All active volunteers registered in the system</p>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading volunteers...</p>
          </div>
        ) : (
          <div className="volunteer-items-grid">
            {volunteers.length === 0 ? (
              <div className="empty-state">
                <Users size={48} className="empty-icon" />
                <p>No volunteers in the system yet.</p>
              </div>
            ) : (
              volunteers.map((volunteer) => (
                <div key={volunteer.id_user} className="volunteer-item">
                  <div className="volunteer-item-details">
                    <h3 className="volunteer-item-name">{volunteer.name}</h3>
                    <span className="volunteer-item-role-badge">{volunteer.role}</span>
                    <span className="volunteer-item-id">ID: {volunteer.id_user}</span>
                    {volunteer.email && <span className="volunteer-item-email">{volunteer.email}</span>}
                  </div>
                  <button
                    onClick={() => handleDelete(volunteer.id_user, volunteer.name)}
                    className="volunteer-delete-btn"
                    title="Deactivate Volunteer"
                    disabled={deletingId === volunteer.id_user}
                  >
                    {deletingId === volunteer.id_user ? (
                      <div className="loading-spinner-small"></div>
                    ) : (
                      <Trash2 className="delete-icon" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveVolunteer
