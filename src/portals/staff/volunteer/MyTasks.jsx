"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiFetch, isAuthenticated } from "../../../api"
import "../../../css/volunteer.css"

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
)

function MyTasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated()) {
        setError("Please log in to view your tasks")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const data = await apiFetch("/api/volunteers/tasks/my")
        console.log("Fetched tasks:", data)
        setTasks(data)
      } catch (err) {
        console.error("Failed to load tasks:", err)
        setError("Failed to load tasks. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending"
      case "completed":
        return "status-completed"
      case "in progress":
        return "status-in-progress"
      default:
        return "status-pending"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date set"
    return new Date(dateString).toLocaleDateString()
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await apiFetch(`/api/volunteers/tasks/${taskId}/status`, "PATCH", { status: newStatus })
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === taskId 
            ? { ...task, status: newStatus }
            : task
        )
      )
      
      alert(`Task marked as ${newStatus}!`)
    } catch (err) {
      console.error("Failed to update task status:", err)
      alert("Failed to update task status. Please try again.")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Tasks...</h2>
            <p className="text-gray-600">Please wait while we load your tasks.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate("/login")} 
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 via-green-700 to-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <PawIcon />
            <div>
              <h1 className="text-2xl font-bold">Hope Paws</h1>
              <p className="text-sm">Animal Rescue & Sanctuary</p>
            </div>
          </div>
          <nav className="flex gap-4">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/animals" className="nav-link">Browse Animals</Link>
            <Link to="/donate" className="nav-link">Donate</Link>
            <Link to="/my-events" className="nav-link">Events</Link>
            <Link to="/volunteerDash" className="nav-link">Dashboard</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/activityHistory" className="nav-link">Activity History</Link>
            <Link to="/applyVolunteer" className="nav-link">Apply</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
            <p className="text-gray-600">View and manage your assigned volunteer tasks</p>
          </div>

          {/* Tasks Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Total Tasks</h3>
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(task => task.status?.toLowerCase() === 'pending').length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Completed</h3>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(task => task.status?.toLowerCase() === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Task List</h2>
            </div>
            
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
                <p className="text-gray-500">You don't have any tasks assigned yet. Check back later or contact a manager.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <div key={task.task_id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.task_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Date:</span> {formatDate(task.task_date)}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(task.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {task.status?.toLowerCase() === 'pending' && (
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => updateTaskStatus(task.task_id, 'In Progress')}
                          >
                            Start
                          </button>
                        )}
                        {task.status?.toLowerCase() !== 'completed' && (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => updateTaskStatus(task.task_id, 'Completed')}
                          >
                            Complete
                          </button>
                        )}
                        {task.status?.toLowerCase() === 'completed' && (
                          <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <Link to="/volunteerDash" className="btn btn-primary mr-4">
              Back to Dashboard
            </Link>
            <Link to="/my-events" className="btn btn-outline">
              View Events
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default MyTasks
