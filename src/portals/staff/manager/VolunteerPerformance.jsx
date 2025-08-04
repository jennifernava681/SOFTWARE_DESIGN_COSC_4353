"use client"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function VolunteerPerformance() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the comprehensive VolunteerReports component
    navigate("/volunteer-reports")
  }, [navigate])

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <div style={{ fontSize: "1.2rem", color: "#6b7280" }}>
        Redirecting to Volunteer Reports...
      </div>
      <div style={{ 
        width: "40px", 
        height: "40px", 
        border: "4px solid #e5e7eb", 
        borderTop: "4px solid #3b82f6", 
        borderRadius: "50%", 
        animation: "spin 1s linear infinite" 
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VolunteerPerformance
