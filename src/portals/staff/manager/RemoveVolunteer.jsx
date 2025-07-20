"use client"

import { useState, useEffect } from "react"
import { Users, Trash2 } from "lucide-react" // Import necessary icons
import NotificationBanner from "../../../NotificationBanner.jsx" // Corrected path
import "../../../css/volunterout.css" // Correctly importing managetasks.css

function RemoveVolunteer() {
  const [volunteers, setVolunteers] = useState([])
  const [isLoading, setIsLoading] = useState(false) // Global loading state
  const [deletingId, setDeletingId] = useState(null) // To track which specific item is being deleted
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    let timer
    if (showBanner) {
      timer = setTimeout(() => setShowBanner(false), 3000)
    }
    return () => clearTimeout(timer)
  }, [showBanner])

  // Mock data for existing volunteers
  useEffect(() => {
    // Simulate loading existing volunteers
    setVolunteers([
      { id_user: 201, name: "Emily White", role: "Animal Care Volunteer" },
      { id_user: 202, name: "David Green", role: "Adoption Event Volunteer" },
      { id_user: 203, name: "Sarah Black", role: "Kennel Cleaning Volunteer" },
      { id_user: 204, name: "Michael Blue", role: "Dog Walking Volunteer" },
      { id_user: 205, name: "Jessica Red", role: "Fundraising Volunteer" },
    ])
  }, [])

  const handleDelete = (volunteerId, volunteerName) => {
    if (window.confirm(`Are you sure you want to remove ${volunteerName} from volunteers?`)) {
      setIsLoading(true)
      setDeletingId(volunteerId) // Set the ID of the item being deleted
      // Simulate API call
      setTimeout(() => {
        setVolunteers((prev) => prev.filter((volunteer) => volunteer.id_user !== volunteerId))
        setBannerMessage(`Volunteer "${volunteerName}" removed successfully!`) // Directly use volunteerName
        setIsLoading(false)
        setDeletingId(null) // Reset deleting ID
        setShowBanner(true)
      }, 1500)
    }
  }

  return (
    <div className="volunteer-page-container">
      <NotificationBanner message={bannerMessage} floating show={showBanner} onClose={() => setShowBanner(false)} />

      <div className="volunteer-main-card">
        {/* Header Section */}
        <div className="volunteer-list-header">
          <h2 className="volunteer-list-title">
            <Users className="header-icon" />
            Current Volunteers ({volunteers.length})
          </h2>
          <p className="volunteer-list-description">All active volunteers registered in the system</p>
        </div>

        {/* Volunteers List */}
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
                  title="Remove Volunteer"
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
