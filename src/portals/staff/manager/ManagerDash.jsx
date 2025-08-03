"use client"
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../api";
import "../../../css/home.css";

// Icons
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26A6.44 6.44 0 0 0 12 12c-1.11 0-2.14.29-3.04.79L7.3 9.26A2.5 2.5 0 0 0 5.29 8H3.46c-.8 0-1.54.37-2.01 1L1.5 16H4v6h16zM12 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
);

const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L1 21h22L12 2zm0 3.17L19.83 19H4.17L12 5.17zM11 16h2v2h-2zm0-6h2v4h-2z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

function ManagerDash() {
  const [dashboardData, setDashboardData] = useState({
    totalAnimals: 0,
    availableAnimals: 0,
    pendingAdoptions: 0,
    pendingSurrenders: 0,
    totalVolunteers: 0,
    activeEvents: 0,
    totalDonations: 0,
    recentDonations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load animals data
      const animalsResponse = await apiFetch("/api/animals", "GET");
      const totalAnimals = animalsResponse.length;
      const availableAnimals = animalsResponse.filter(animal => animal.status === 'available').length;

      // Load adoption requests
      const adoptionsResponse = await apiFetch("/api/adoptions", "GET");
      const pendingAdoptions = adoptionsResponse.filter(adoption => adoption.status === 'pending').length;

      // Load surrender requests
      const surrendersResponse = await apiFetch("/api/surrender", "GET");
      const pendingSurrenders = surrendersResponse.filter(surrender => surrender.status === 'pending').length;

      // Load volunteers data
      const volunteersResponse = await apiFetch("/api/volunteers", "GET");
      const totalVolunteers = volunteersResponse.length;

      // Load events data
      const eventsResponse = await apiFetch("/api/events", "GET");
      const activeEvents = eventsResponse.filter(event => new Date(event.date) >= new Date()).length;

      // Load donations data
      const donationsResponse = await apiFetch("/api/donations", "GET");
      const totalDonations = donationsResponse.length;
      const recentDonations = donationsResponse
        .sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date))
        .slice(0, 5);

      setDashboardData({
        totalAnimals,
        availableAnimals,
        pendingAdoptions,
        pendingSurrenders,
        totalVolunteers,
        activeEvents,
        totalDonations,
        recentDonations
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", link }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{isLoading ? "..." : value}</p>
      </div>
      {link && (
        <Link to={link} className="stat-link">
          View Details →
        </Link>
      )}
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, link, color = "blue" }) => (
    <Link to={link} className={`quick-action-card action-${color}`}>
      <div className="action-icon">
        <Icon />
      </div>
      <div className="action-content">
        <h4 className="action-title">{title}</h4>
        <p className="action-description">{description}</p>
      </div>
    </Link>
  );

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <AlertIcon />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-icon">
            <PawIcon />
          </div>
          <div className="header-text">
            <h1>Manager Dashboard</h1>
            <p>Welcome back! Here's what's happening at Hope Paws today.</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={loadDashboardData} className="refresh-button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Animals"
          value={dashboardData.totalAnimals}
          icon={PawIcon}
          color="green"
          link="/manageanimals"
        />
        <StatCard
          title="Available Animals"
          value={dashboardData.availableAnimals}
          icon={PawIcon}
          color="blue"
          link="/manageanimals"
        />
        <StatCard
          title="Pending Adoptions"
          value={dashboardData.pendingAdoptions}
          icon={UsersIcon}
          color="orange"
          link="/reviewAdoptions"
        />
        <StatCard
          title="Pending Surrenders"
          value={dashboardData.pendingSurrenders}
          icon={AlertIcon}
          color="red"
          link="/reviewSurrenderRequest"
        />
        <StatCard
          title="Active Volunteers"
          value={dashboardData.totalVolunteers}
          icon={UsersIcon}
          color="purple"
          link="/reviewVolunteersApps"
        />
        <StatCard
          title="Upcoming Events"
          value={dashboardData.activeEvents}
          icon={CalendarIcon}
          color="teal"
          link="/eventmanager"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <QuickActionCard
            title="Manage Animals"
            description="Add, edit, or remove animals from the shelter"
            icon={PawIcon}
            link="/manageanimals"
            color="green"
          />
          <QuickActionCard
            title="Review Applications"
            description="Review volunteer and adoption applications"
            icon={UsersIcon}
            link="/reviewVolunteersApps"
            color="blue"
          />
          <QuickActionCard
            title="Event Management"
            description="Create and manage upcoming events"
            icon={CalendarIcon}
            link="/eventmanager"
            color="purple"
          />
          <QuickActionCard
            title="Donation Reports"
            description="View donation reports and analytics"
            icon={DollarIcon}
            link="/donatereports"
            color="orange"
          />
          <QuickActionCard
            title="Assign Tasks"
            description="Assign tasks to volunteers"
            icon={CheckIcon}
            link="/assigntasks"
            color="teal"
          />
          <QuickActionCard
            title="Performance Review"
            description="Review volunteer performance metrics"
            icon={UsersIcon}
            link="/volunteerPerformance"
            color="indigo"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2>Recent Donations</h2>
        <div className="activity-list">
          {dashboardData.recentDonations.length > 0 ? (
            dashboardData.recentDonations.map((donation, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <DollarIcon />
                </div>
                <div className="activity-content">
                  <h4>{donation.name || "Anonymous"}</h4>
                  <p>{donation.donation_type} - ${donation.amount}</p>
                  <span className="activity-date">
                    {new Date(donation.donation_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <p>No recent donations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerDash;
