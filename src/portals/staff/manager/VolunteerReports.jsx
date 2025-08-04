"use client"
import { useState, useEffect } from "react"
import { apiFetch } from "../../../api"
import NotificationBanner from "../../../NotificationBanner"
import "../../../css/VolunteerReports.css"

// Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C16 5.10457 15.1046 6 14 6C12.8954 6 12 5.10457 12 4C12 2.89543 12.8954 2 14 2C15.1046 2 16 2.89543 16 4ZM21 4C21 5.10457 20.1046 6 19 6C17.8954 6 17 5.10457 17 4C17 2.89543 17.8954 2 19 2C20.1046 2 21 2.89543 21 4ZM14 8C11.7909 8 10 9.79086 10 12V16H18V12C18 9.79086 16.2091 8 14 8ZM19 8C18.4477 8 18 8.44772 18 9V16H22V12C22 10.3431 20.6569 9 19 9C18.4477 9 18 8.55228 18 8H19ZM6 4C6 5.10457 5.10457 6 4 6C2.89543 6 2 5.10457 2 4C2 2.89543 2.89543 2 4 2C5.10457 2 6 2.89543 6 4ZM11 4C11 5.10457 10.1046 6 9 6C7.89543 6 7 5.10457 7 4C7 2.89543 7.89543 2 9 2C10.1046 2 11 2.89543 11 4ZM4 8C1.79086 8 0 9.79086 0 12V16H8V12C8 9.79086 6.20914 8 4 8Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20H19V18H5M19 9H15V3H9V9H5L12 16L19 9Z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" />
  </svg>
)

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H9V11H7V13ZM7 17H9V15H7V17ZM7 9H9V7H7V9ZM11 13H13V11H11V13ZM11 17H13V15H11V17ZM11 9H13V7H11V9ZM15 13H17V11H15V13ZM15 17H17V15H15V17ZM15 9H17V7H15V9ZM19 13H21V11H19V13ZM19 17H21V15H19V17ZM19 9H21V7H19V9Z" />
  </svg>
)

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z" />
  </svg>
)

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

// Helper function to format hours
const formatHours = (hours) => {
  if (!hours || hours === 0) return "0"
  return Number(hours).toFixed(1)
}

// Helper function to calculate percentage
const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0
  return Math.round((part / total) * 100)
}

// CSV Export function
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export")
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === "string" && value.includes(",") 
          ? `"${value}"` 
          : value
      }).join(",")
    )
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// PDF Export function (basic implementation)
const exportToPDF = (data, filename) => {
  // This is a basic implementation - in a real app, you'd use a library like jsPDF
  alert("PDF export functionality would be implemented with a PDF library like jsPDF")
  console.log("PDF export data:", data)
}

function VolunteerReports() {
  const [activeTab, setActiveTab] = useState("participation")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")
  const [bannerType, setBannerType] = useState("success")

  // Report data states
  const [volunteerParticipation, setVolunteerParticipation] = useState([])
  const [volunteerPerformance, setVolunteerPerformance] = useState([])
  const [eventManagement, setEventManagement] = useState([])
  const [monthlySummary, setMonthlySummary] = useState(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showBanner])

  const showNotification = (message, type = "success") => {
    setBannerMessage(message)
    setBannerType(type)
    setShowBanner(true)
  }

  const loadVolunteerParticipation = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiFetch("/api/reports/volunteers/participation", "GET")
      setVolunteerParticipation(data)
      showNotification("Volunteer participation data loaded successfully")
    } catch (err) {
      console.error("Error loading volunteer participation:", err)
      setError("Failed to load volunteer participation data")
      showNotification("Failed to load volunteer participation data", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadVolunteerPerformance = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiFetch("/api/reports/volunteers/performance", "GET")
      setVolunteerPerformance(data)
      showNotification("Volunteer performance data loaded successfully")
    } catch (err) {
      console.error("Error loading volunteer performance:", err)
      setError("Failed to load volunteer performance data")
      showNotification("Failed to load volunteer performance data", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadEventManagement = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiFetch("/api/reports/events/management", "GET")
      setEventManagement(data)
      showNotification("Event management data loaded successfully")
    } catch (err) {
      console.error("Error loading event management:", err)
      setError("Failed to load event management data")
      showNotification("Failed to load event management data", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlySummary = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiFetch(`/api/reports/monthly/summary?year=${selectedYear}&month=${selectedMonth}`, "GET")
      setMonthlySummary(data)
      showNotification("Monthly summary data loaded successfully")
    } catch (err) {
      console.error("Error loading monthly summary:", err)
      setError("Failed to load monthly summary data")
      showNotification("Failed to load monthly summary data", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadVolunteerDetails = async (volunteerId) => {
    try {
      const data = await apiFetch(`/api/reports/volunteers/${volunteerId}/activity`, "GET")
      setSelectedVolunteer(data)
    } catch (err) {
      console.error("Error loading volunteer details:", err)
      showNotification("Failed to load volunteer details", "error")
    }
  }

  const loadEventDetails = async (eventId) => {
    try {
      const data = await apiFetch(`/api/reports/events/${eventId}/detailed`, "GET")
      setSelectedEvent(data)
    } catch (err) {
      console.error("Error loading event details:", err)
      showNotification("Failed to load event details", "error")
    }
  }

  const handleExportCSV = (data, filename) => {
    try {
      exportToCSV(data, filename)
      showNotification(`${filename} exported to CSV successfully`)
    } catch (err) {
      console.error("Export error:", err)
      showNotification("Failed to export CSV", "error")
    }
  }

  const handleExportPDF = (data, filename) => {
    try {
      exportToPDF(data, filename)
      showNotification(`${filename} export initiated`)
    } catch (err) {
      console.error("Export error:", err)
      showNotification("Failed to export PDF", "error")
    }
  }

  const handleRefresh = () => {
    setError("")
    switch (activeTab) {
      case "participation":
        loadVolunteerParticipation()
        break
      case "performance":
        loadVolunteerPerformance()
        break
      case "events":
        loadEventManagement()
        break
      case "monthly":
        loadMonthlySummary()
        break
      default:
        break
    }
  }

  useEffect(() => {
    handleRefresh()
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "monthly") {
      loadMonthlySummary()
    }
  }, [selectedYear, selectedMonth])

  const renderVolunteerParticipation = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>Volunteer Participation History</h3>
        <div className="report-actions">
          <button
            onClick={() => handleExportCSV(volunteerParticipation, "volunteer_participation")}
            className="btn-export"
          >
            <DownloadIcon />
            Export CSV
          </button>
          <button
            onClick={() => handleExportPDF(volunteerParticipation, "volunteer_participation")}
            className="btn-export"
          >
            <FileTextIcon />
            Export PDF
          </button>
        </div>
      </div>

      <div className="report-content">
        {volunteerParticipation.length === 0 ? (
          <p>No volunteer participation data available.</p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Email</th>
                  <th>Total Tasks</th>
                  <th>Completed</th>
                  <th>Attended Events</th>
                  <th>Registered Events</th>
                  <th>Total Hours</th>
                  <th>Avg Hours/Task</th>
                  <th>First Participation</th>
                  <th>Last Participation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteerParticipation.map((volunteer) => (
                  <tr key={volunteer.id_user}>
                    <td>{volunteer.name}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.total_tasks || 0}</td>
                    <td>{volunteer.completed_tasks || 0}</td>
                    <td>{volunteer.attended_events || 0}</td>
                    <td>{volunteer.registered_events || 0}</td>
                    <td>{formatHours(volunteer.total_hours)}</td>
                    <td>{formatHours(volunteer.avg_hours_per_task)}</td>
                    <td>{formatDate(volunteer.first_participation)}</td>
                    <td>{formatDate(volunteer.last_participation)}</td>
                    <td>
                      <button
                        onClick={() => loadVolunteerDetails(volunteer.id_user)}
                        className="btn-details"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedVolunteer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedVolunteer.volunteer.name} - Activity Details</h3>
              <button onClick={() => setSelectedVolunteer(null)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="volunteer-stats">
                <h4>Summary Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Activities:</span>
                    <span className="stat-value">{selectedVolunteer.stats.total_activities}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed Tasks:</span>
                    <span className="stat-value">{selectedVolunteer.stats.completed_tasks}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Attended Events:</span>
                    <span className="stat-value">{selectedVolunteer.stats.attended_events}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Hours:</span>
                    <span className="stat-value">{formatHours(selectedVolunteer.stats.total_hours)}</span>
                  </div>
                </div>
              </div>
              
              <div className="activity-list">
                <h4>Activity History</h4>
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Task/Event</th>
                      <th>Status</th>
                      <th>Hours</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVolunteer.activities.map((activity, index) => (
                      <tr key={index}>
                        <td>{formatDate(activity.participation_date)}</td>
                        <td>{activity.task_name || activity.event_title || "N/A"}</td>
                        <td>
                          <span className={`status-badge status-${activity.status}`}>
                            {activity.status}
                          </span>
                        </td>
                        <td>{formatHours(activity.hours_worked)}</td>
                        <td>{activity.notes || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderVolunteerPerformance = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>Volunteer Performance Metrics</h3>
        <div className="report-actions">
          <button
            onClick={() => handleExportCSV(volunteerPerformance, "volunteer_performance")}
            className="btn-export"
          >
            <DownloadIcon />
            Export CSV
          </button>
          <button
            onClick={() => handleExportPDF(volunteerPerformance, "volunteer_performance")}
            className="btn-export"
          >
            <FileTextIcon />
            Export PDF
          </button>
        </div>
      </div>

      <div className="report-content">
        {volunteerPerformance.length === 0 ? (
          <p>No volunteer performance data available.</p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Email</th>
                  <th>Total Activities</th>
                  <th>Completed Tasks</th>
                  <th>Attended Events</th>
                  <th>Total Hours</th>
                  <th>Avg Hours/Activity</th>
                  <th>No Shows</th>
                  <th>Reliability %</th>
                </tr>
              </thead>
              <tbody>
                {volunteerPerformance.map((volunteer) => (
                  <tr key={volunteer.id_user}>
                    <td>{volunteer.name}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.total_activities || 0}</td>
                    <td>{volunteer.completed_tasks || 0}</td>
                    <td>{volunteer.attended_events || 0}</td>
                    <td>{formatHours(volunteer.total_hours)}</td>
                    <td>{formatHours(volunteer.avg_hours_per_activity)}</td>
                    <td>{volunteer.no_shows || 0}</td>
                    <td>
                      <span className={`reliability-badge reliability-${volunteer.reliability_percentage >= 80 ? 'high' : volunteer.reliability_percentage >= 60 ? 'medium' : 'low'}`}>
                        {volunteer.reliability_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const renderEventManagement = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>Event Management Report</h3>
        <div className="report-actions">
          <button
            onClick={() => handleExportCSV(eventManagement, "event_management")}
            className="btn-export"
          >
            <DownloadIcon />
            Export CSV
          </button>
          <button
            onClick={() => handleExportPDF(eventManagement, "event_management")}
            className="btn-export"
          >
            <FileTextIcon />
            Export PDF
          </button>
        </div>
      </div>

      <div className="report-content">
        {eventManagement.length === 0 ? (
          <p>No event management data available.</p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Urgency</th>
                  <th>Total Volunteers</th>
                  <th>Attended</th>
                  <th>Registered</th>
                  <th>Completed Tasks</th>
                  <th>Total Hours</th>
                  <th>Avg Hours/Volunteer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventManagement.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.location}</td>
                    <td>
                      <span className={`urgency-badge urgency-${event.urgency}`}>
                        {event.urgency}
                      </span>
                    </td>
                    <td>{event.total_volunteers || 0}</td>
                    <td>{event.attended_volunteers || 0}</td>
                    <td>{event.registered_volunteers || 0}</td>
                    <td>{event.completed_tasks || 0}</td>
                    <td>{formatHours(event.total_hours_worked)}</td>
                    <td>{formatHours(event.avg_hours_per_volunteer)}</td>
                    <td>
                      <button
                        onClick={() => loadEventDetails(event.id)}
                        className="btn-details"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedEvent.event.title} - Event Details</h3>
              <button onClick={() => setSelectedEvent(null)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="event-info">
                <h4>Event Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(selectedEvent.event.date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{selectedEvent.event.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Urgency:</span>
                    <span className="info-value">{selectedEvent.event.urgency}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Required Skills:</span>
                    <span className="info-value">{selectedEvent.event.required_skills.join(", ") || "None"}</span>
                  </div>
                </div>
              </div>

              <div className="event-stats">
                <h4>Event Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Volunteers:</span>
                    <span className="stat-value">{selectedEvent.stats.total_volunteers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Attended:</span>
                    <span className="stat-value">{selectedEvent.stats.attended_volunteers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Registered:</span>
                    <span className="stat-value">{selectedEvent.stats.registered_volunteers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Hours:</span>
                    <span className="stat-value">{formatHours(selectedEvent.stats.total_hours_worked)}</span>
                  </div>
                </div>
              </div>

              <div className="volunteer-list">
                <h4>Volunteer Participation</h4>
                <table className="volunteer-table">
                  <thead>
                    <tr>
                      <th>Volunteer</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Participation Date</th>
                      <th>Hours Worked</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEvent.volunteers.map((volunteer, index) => (
                      <tr key={index}>
                        <td>{volunteer.name}</td>
                        <td>{volunteer.email}</td>
                        <td>
                          <span className={`status-badge status-${volunteer.status}`}>
                            {volunteer.status}
                          </span>
                        </td>
                        <td>{formatDate(volunteer.participation_date)}</td>
                        <td>{formatHours(volunteer.hours_worked)}</td>
                        <td>{volunteer.notes || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderMonthlySummary = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>Monthly Activity Summary</h3>
        <div className="report-filters">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="filter-select"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="filter-select"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleDateString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="report-actions">
          <button
            onClick={() => monthlySummary && handleExportCSV(monthlySummary.monthlyBreakdown, `monthly_summary_${selectedYear}_${selectedMonth}`)}
            className="btn-export"
            disabled={!monthlySummary}
          >
            <DownloadIcon />
            Export CSV
          </button>
          <button
            onClick={() => monthlySummary && handleExportPDF(monthlySummary, `monthly_summary_${selectedYear}_${selectedMonth}`)}
            className="btn-export"
            disabled={!monthlySummary}
          >
            <FileTextIcon />
            Export PDF
          </button>
        </div>
      </div>

      <div className="report-content">
        {!monthlySummary ? (
          <p>Loading monthly summary...</p>
        ) : (
          <div className="monthly-summary">
            <div className="summary-stats">
              <div className="stat-card">
                <h4>Total Events</h4>
                <span className="stat-number">{monthlySummary.summary.total_events}</span>
              </div>
              <div className="stat-card">
                <h4>Active Volunteers</h4>
                <span className="stat-number">{monthlySummary.summary.active_volunteers}</span>
              </div>
              <div className="stat-card">
                <h4>Total Activities</h4>
                <span className="stat-number">{monthlySummary.summary.total_activities}</span>
              </div>
              <div className="stat-card">
                <h4>Total Hours</h4>
                <span className="stat-number">{formatHours(monthlySummary.summary.total_hours_worked)}</span>
              </div>
              <div className="stat-card">
                <h4>Completed Tasks</h4>
                <span className="stat-number">{monthlySummary.summary.completed_tasks}</span>
              </div>
              <div className="stat-card">
                <h4>Attended Events</h4>
                <span className="stat-number">{monthlySummary.summary.attended_events}</span>
              </div>
            </div>

            <div className="daily-breakdown">
              <h4>Daily Activity Breakdown</h4>
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Volunteers</th>
                    <th>Activities</th>
                    <th>Hours Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.monthlyBreakdown.map((day, index) => (
                    <tr key={index}>
                      <td>{formatDate(day.date)}</td>
                      <td>{day.volunteers}</td>
                      <td>{day.activities}</td>
                      <td>{formatHours(day.hours_worked)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="reports-container">
      <NotificationBanner
        message={bannerMessage}
        floating
        show={showBanner}
        onClose={() => setShowBanner(false)}
        type={bannerType}
      />

      <div className="reports-header">
        <h2>Volunteer & Event Reports</h2>
        <p>Generate comprehensive reports on volunteer activities and event management</p>
      </div>

      <div className="reports-tabs">
        <button
          className={`tab-button ${activeTab === "participation" ? "active" : ""}`}
          onClick={() => setActiveTab("participation")}
        >
          <UsersIcon />
          Participation History
        </button>
        <button
          className={`tab-button ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          <TrendingUpIcon />
          Performance Metrics
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <CalendarIcon />
          Event Management
        </button>
        <button
          className={`tab-button ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => setActiveTab("monthly")}
        >
          <BarChartIcon />
          Monthly Summary
        </button>
      </div>

      <div className="reports-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading report data...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRefresh} className="btn-retry">
              <RefreshIcon />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === "participation" && renderVolunteerParticipation()}
            {activeTab === "performance" && renderVolunteerPerformance()}
            {activeTab === "events" && renderEventManagement()}
            {activeTab === "monthly" && renderMonthlySummary()}
          </>
        )}
      </div>
    </div>
  )
}

export default VolunteerReports 