"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/home.css";
import NotificationBanner from "../../NotificationBanner";

const PawIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

const DonationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    donationType: "",
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowBanner(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Donation submitted:", formData);
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-background-overlay"></div>
        <div className="floating-paws">
          <div className="floating-paw paw-1"><PawIcon /></div>
          <div className="floating-paw paw-2"><PawIcon /></div>
          <div className="floating-paw paw-3"><PawIcon /></div>
          <div className="floating-paw paw-4"><PawIcon /></div>
          <div className="floating-paw paw-5"><PawIcon /></div>
        </div>
      </div>

      <NotificationBanner
        message="Thank you for your donation!"
        floating
        show={showBanner}
        onClose={() => setShowBanner(false)}
      />

      <div className="login-container">
        <div className="login-branding">
          <div className="login-logo">
            <div className="login-logo-icon"><PawIcon /></div>
            <div className="login-logo-text">
              <h1>Hope Paws</h1>
              <p>Animal Rescue & Sanctuary</p>
            </div>
          </div>
          <div className="login-welcome">
            <h2>Make a Difference</h2>
            <p>Your support helps us care for rescued animals and find them loving homes.</p>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h3>Donate Now</h3>
              <p>Choose how you’d like to support us</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Donation Type</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="donationType"
                      value="money"
                      onChange={handleChange}
                      required
                    />
                    <span className="ml-2">Money</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="donationType"
                      value="items"
                      onChange={handleChange}
                    />
                    <span className="ml-2">Items</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount / Items Description</label>
                <textarea
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. $50 or 2 bags of dog food"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={isLoading} className={`login-button ${isLoading ? "loading" : ""}`}>
                {isLoading ? <div className="loading-spinner"></div> : "Submit Donation"}
              </button>
            </form>

            <div className="login-footer">
              <p className="back-home">
                <Link to="/" className="home-link">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
