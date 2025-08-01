"use client"

import "../../../css/managetasks.css" // Import the new CSS file
import { useState, useEffect } from "react"
import { X, Pencil } from "lucide-react" // Import necessary icons

function AssignTasks() {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    task_date: "",
    status: "",
    USERS_id_user: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [employees, setEmployees] = useState([]) // New state for employees

  // Mock data for existing tasks
  useEffect(() => {
    // Simulate loading existing tasks
    setTasks([
      {
        task_id: 1,
        task_name: "Feed Animals",
        description: "Ensure all animals are fed according to their diet plan.",
        task_date: "2024-07-20",
        status: "Pending",
        created_at: "2024-07-19T10:00:00Z",
        USERS_id_user: 101,
      },
      {
        task_id: 2,
        task_name: "Clean Kennels",
        description: "Thoroughly clean and disinfect all dog kennels.",
        task_date: "2024-07-20",
        status: "Completed",
        created_at: "2024-07-19T11:30:00Z",
        USERS_id_user: 102,
      },
      {
        task_id: 3,
        task_name: "Veterinary Check-up",
        description: "Schedule and attend vet appointments for new intakes.",
        task_date: "2024-07-21",
        status: "In Progress",
        created_at: "2024-07-19T14:00:00Z",
        USERS_id_user: 101,
      },
    ])

    // Simulate loading employees
    setEmployees([
      { id_user: 101, name: "Alice Smith", role: "Caregiver" },
      { id_user: 102, name: "Bob Johnson", role: "Veterinarian" },
      { id_user: 103, name: "Charlie Brown", role: "Administrator" },
      { id_user: 104, name: "Diana Prince", role: "Volunteer" },
    ])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      if (editingTask) {
        // Update existing task
        setTasks((prev) =>
          prev.map((task) =>
            task.task_id === editingTask.task_id ? { ...formData, task_id: editingTask.task_id } : task,
          ),
        )
        setEditingTask(null)
      } else {
        // Add new task
        const newTask = {
          ...formData,
          task_id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.task_id)) + 1 : 1,
          created_at: new Date().toISOString(),
        }
        setTasks((prev) => [...prev, newTask])
      }
      setIsLoading(false)
      setShowSuccessMessage(true)
      setShowForm(false)
      resetForm()
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }, 2000)
  }

  const resetForm = () => {
    setFormData({
      task_name: "",
      description: "",
      task_date: "",
      status: "",
      USERS_id_user: "",
    })
  }

  const handleEdit = (task) => {
    setFormData({
      task_name: task.task_name || "",
      description: task.description || "",
      task_date: task.task_date || "",
      status: task.status || "",
      USERS_id_user: task.USERS_id_user?.toString() || "",
    })
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task record?")) {
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId))
    }
  }

  const handleEmployeeClick = (employeeId) => {
    setFormData((prev) => ({
      ...prev,
      USERS_id_user: employeeId.toString(),
    }))
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending"
      case "completed":
        return "status-adopted" // Reusing adopted for completed based on your CSS
      case "in progress":
        return "status-foster" // Reusing foster for in progress based on your CSS
      default:
        return "status-available" // Default for other states
    }
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="notification-overlay">
          <div className="notification-banner floating show">
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Task {editingTask ? "updated" : "added"} successfully!
          </div>
        </div>
      )}
      {/* Main Content */}
      <section className="tasks">
        <div className="tasks-container">
          <div className="section-header">
            <h2 className="section-title">Manage Tasks</h2>
            <p className="section-description">Add, edit, and manage task records in the system</p>
            <div className="section-divider"></div>
          </div>
          {/* Action Buttons */}
          <div className="action-buttons-container">
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingTask(null)
                resetForm()
              }}
              className="btn-cta btn-cta-primary"
            >
              {showForm ? "Cancel" : "Add New Task"}
            </button>
          </div>
          {/* Add/Edit Task Form */}
          {showForm && (
            <div className="main-card form-card">
              <div className="form-content">
                <h3 className="form-title">{editingTask ? "Edit Task" : "Add New Task"}</h3>
                <form className="donation-form" onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="task_name" className="form-label">
                        Task Name *
                      </label>
                      <select
                        id="task_name"
                        name="task_name"
                        value={formData.task_name}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select Task</option>
                        <option value="Feed Animals">Feed Animals</option>
                        <option value="Clean Kennels">Clean Kennels</option>
                        <option value="Veterinary Check-up">Veterinary Check-up</option>
                        <option value="Groom Animals">Groom Animals</option>
                        <option value="Administer Medication">Administer Medication</option>
                        <option value="Walk Dogs">Walk Dogs</option>
                        <option value="Clean Cages">Clean Cages</option>
                        <option value="Update Records">Update Records</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="task_date" className="form-label">
                        Task Date *
                      </label>
                      <input
                        type="date"
                        id="task_date"
                        name="task_date"
                        value={formData.task_date}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="status" className="form-label">
                        Status *
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="USERS_id_user" className="form-label">
                        Assigned User ID
                      </label>
                      <input
                        type="number"
                        id="USERS_id_user"
                        name="USERS_id_user"
                        value={formData.USERS_id_user}
                        onChange={handleChange}
                        placeholder="Enter user ID or click on an employee below"
                        className="form-input"
                      />
                    </div>
                  </div>
                  {/* Description */}
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter task description"
                      className="form-textarea"
                      rows="4"
                    />
                  </div>
                  {/* Submit Button */}
                  <div className="submit-button-wrapper">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`submit-button ${isLoading ? "loading" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner"></div>
                          {editingTask ? "Updating..." : "Adding..."}
                        </>
                      ) : editingTask ? (
                        "Update Task"
                      ) : (
                        "Add Task"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Employees List */}
          <div className="main-card">
            <div className="form-content">
              <h3 className="form-title">Available Employees ({employees.length})</h3>
              {employees.length === 0 ? (
                <div className="empty-state">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>No employees in the system yet.</p>
                </div>
              ) : (
                <div className="employees-grid">
                  {employees.map((employee) => (
                    <div
                      key={employee.id_user}
                      className="employee-card"
                      onClick={() => handleEmployeeClick(employee.id_user)}
                      title={`Click to assign task to ${employee.name}`}
                    >
                      <h4 className="employee-name">{employee.name}</h4>
                      <p className="employee-role">{employee.role}</p>
                      <span className="employee-id">ID: {employee.id_user}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tasks List */}
          <div className="main-card">
            <div className="form-content">
              <h3 className="form-title">Current Tasks ({tasks.length})</h3>
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>No tasks in the system yet.</p>
                </div>
              ) : (
                <div className="tasks-grid">
                  {tasks.map((task) => (
                    <div key={task.task_id} className="task-card">
                      {/* Task Info */}
                      <div className="task-info">
                        <div className="task-header">
                          <h4 className="task-name">{task.task_name}</h4>
                          <span className={`status-badge ${getStatusClass(task.status)}`}>{task.status}</span>
                        </div>
                        <div className="task-details">
                          <span>
                            <strong>Date:</strong> {task.task_date}
                          </span>
                          <span>
                            <strong>User ID:</strong> {task.USERS_id_user}
                          </span>
                          <span>
                            <strong>Created:</strong> {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {task.description && <p className="task-note">{task.description}</p>}
                      </div>
                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(task)} className="action-btn edit-btn" title="Edit Task">
                          <Pencil className="icon" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.task_id)}
                          className="action-btn delete-btn"
                          title="Delete Task"
                        >
                          <X className="icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AssignTasks
