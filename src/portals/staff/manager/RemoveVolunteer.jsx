"use client"

import { useState, useEffect } from "react"
import { Users, Trash2 } from "lucide-react"
import NotificationBanner from "../../../NotificationBanner.jsx"
import "../../../css/volunterout.css"

function RemoveVolunteer() {
  const [volunteers, setVolunteers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")

  useEffect(() => {
    let timer
    if (showBanner) {
      timer = setTimeout(() => setShowBanner(false), 3000)
    }
    return () => clearTimeout(timer)
  }, [showBanner])

  // ✅ Fetch real volunteer data from the backend
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/volunteers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await res.json()
        setVolunteers(data)
      } catch (error) {
        console.error("Error fetching volunteers:", error)
      }
    }

    fetchVolunteers()
  }, [])

  // ✅ Deactivate volunteer (PATCH request)
  const handleDelete = async (volunteerId, volunteerName) => {
    if (window.confirm(`Are you sure you want to deactivate ${volunteerName}?`)) {
      setIsLoading(true)
      setDeletingId(volunteerId)

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/volunteers/${volunteerId}/deactivate`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("Failed to deactivate volunteer")

        setVolunteers((prev) => prev.filter((v) => v.id_user !== volunteerId))
        setBannerMessage(`Volunteer "${volunteerName}" deactivated successfully!`)
        setShowBanner(true)
      } catch (err) {
        console.error(err)
        setBannerMessage("Failed to deactivate volunteer")
        setShowBanner(true)
      } finally {
        setIsLoading(false)
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="volunteer-page-container">
      <NotificationBanner message={bannerMessage} floating show={showBanner} onClose={() => setShowBanner(false)} />

      <div className="volunteer-main-card">
        <div className="volunteer-list-header">
          <h2 className="volunteer-list-title">
            <Users className="header-icon" />
            Current Volunteers ({volunteers.length})
          </h2>
          <p className="volunteer-list-description">All active volunteers registered in the system</p>
        </div>

        <div className="volunteer-items-grid">
          {volunteers.length === 0 ? (
            <div className="empty-state">
              <p>No volunteers in the system yet.</p>
            </div>
          ) : (
            volunteers.map((volunteer) => (
              <div key={volunteer.id_user} className="volunteer-item">
                <div className="volunteer-item-details">
                  <h3 className="volunteer-item-name">{volunteer.name}</h3>
                  <span className="volunteer-item-role-badge">{volunteer.role}</span>
                  <span className="volunteer-item-id">ID: {volunteer.id_user}</span>
                </div>
                <button
                  onClick={() => handleDelete(volunteer.id_user, volunteer.name)}
                  className="volunteer-delete-btn"
                  title="Deactivate Volunteer"
                  disabled={isLoading && deletingId === volunteer.id_user}
                >
                  {isLoading && deletingId === volunteer.id_user ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <Trash2 className="delete-icon" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoveVolunteer
