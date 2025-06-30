import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../../css/EventFormPage.css";


const EventManager = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    assignedTo: "",
    dueDate: "",
    dueTime: "",
    location: "",
    specialInstructions: "",
    skillsRequired: [],
  });

  const categories = [
    "Animal Care",
    "Feeding",
    "Cleaning",
    "Dog Walking",
    "Cat Socialization",
    "Medical Assistance",
    "Administrative",
    "Maintenance",
    "Event Setup",
    "Transportation",
  ];

  const priorities = ["Low", "Medium", "High", "Urgent"];

  const availableSkills = [
    "Animal Handling",
    "Medical Experience",
    "Heavy Lifting",
    "Dog Training",
    "Cat Care",
    "Administrative Skills",
    "Driving License",
    "Event Planning",
  ];

  const volunteers = ["Unassigned", "Sarah Johnson", "Mike Chen", "Emma Davis", "Alex Rodriguez", "Lisa Thompson"];

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now().toString(),
      ...formData,
    };

    setTasks([...tasks, newTask]);

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "",
      assignedTo: "",
      dueDate: "",
      dueTime: "",
      location: "",
      specialInstructions: "",
      skillsRequired: [],
    });
  };

  const addSkill = (skill) => {
    if (!formData.skillsRequired.includes(skill)) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, skill],
      });
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter((s) => s !== skill),
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Urgent":
        return "badge-priority-urgent";
      case "High":
        return "badge-priority-high";
      case "Medium":
        return "badge-priority-medium";
      case "Low":
        return "badge-priority-low";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="task-manager">
      <div className="task-container">
        <div className="task-header">
          <h1 className="task-title">Animal Shelter Task Manager</h1>
          <p className="task-subtitle">Create and manage volunteer tasks</p>
        </div>

        <div className="task-grid">
          {/* Task Creation Form */}
          <div className="task-card">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Task
              </h2>
              <p className="card-description">Fill out the details to create a new volunteer task</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Task Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Feed morning shift dogs"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    placeholder="Detailed description of the task..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      required
                    >
                      <option value="">Select priority</option>
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign to Volunteer</label>
                  <select
                    className="form-select"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    required
                  >
                    <option value="">Select volunteer</option>
                    {volunteers.map((volunteer) => (
                      <option key={volunteer} value={volunteer}>
                        {volunteer}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label htmlFor="dueDate" className="form-label">
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      className="form-input"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dueTime" className="form-label">
                      Due Time
                    </label>
                    <input
                      id="dueTime"
                      type="time"
                      className="form-input"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Dog Kennel Area A, Cat Room 2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <div className="skills-container">
                    {formData.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="badge badge-secondary badge-removable"
                        onClick={() => removeSkill(skill)}
                        title="Click to remove"
                      >
                        {skill} ×
                      </span>
                    ))}
                  </div>
                  <select
                    className="form-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        addSkill(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Add required skills</option>
                    {availableSkills
                      .filter((skill) => !formData.skillsRequired.includes(skill))
                      .map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="specialInstructions" className="form-label">
                    Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    className="form-textarea"
                    placeholder="Any special notes or instructions for the volunteer..."
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  Create Task
                </button>
              </form>
            </div>
          </div>

          {/* Task List */}
          <div className="task-card">
            <div className="card-header">
              <h2 className="card-title">Recent Tasks</h2>
              <p className="card-description">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} created
              </p>
            </div>
            <div className="card-content">
              <div className="task-list">
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <p>No tasks created yet. Create your first task using the form.</p>
                  </div>
                ) : (
                  tasks
                    .slice()
                    .reverse()
                    .map((task) => (
                      <div key={task.id} className="task-item">
                        <div className="task-item-header">
                          <h3 className="task-item-title">{task.title}</h3>
                          <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                        </div>

                        <p className="task-item-description">{task.description}</p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <span className="badge badge-secondary">{task.category}</span>
                          {task.skillsRequired.map((skill) => (
                            <span key={skill} className="badge badge-secondary">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="task-separator"></div>

                        <div className="task-item-meta">
                          <div className="task-item-meta-item">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {task.assignedTo}
                          </div>
                          <div className="task-item-meta-item">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {task.dueDate}
                          </div>
                          <div className="task-item-meta-item">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {task.dueTime}
                          </div>
                          {task.location && (
                            <div className="task-item-meta-item">
                              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {task.location}
                            </div>
                          )}
                        </div>

                        {task.specialInstructions && (
                          <div className="task-special-instructions">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            <span>{task.specialInstructions}</span>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManager;