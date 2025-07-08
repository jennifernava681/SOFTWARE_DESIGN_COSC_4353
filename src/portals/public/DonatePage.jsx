"use client";

import "../../css/DonatePage.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import NotificationBanner from "../../NotificationBanner";

// Proper Paw Print Icon that matches the design
//  const PawIcon() {
//    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
//      <ellipse cx="12" cy="16" rx="4" ry="3" />
//      <circle cx="8" cy="10" r="1.5" />
//      <circle cx="12" cy="8" r="1.5" />
//      <circle cx="16" cy="10" r="1.5" />
//      <circle cx="18" cy="13" r="1.2" />
//    </svg>

// };

function DonatePage() {

  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [endDate, setEndDate] = useState("");
  const [designation, setDesignation] = useState("");

  const [isFocused, setIsFocused] = useState(false);

  // const navigate = useNavigate();

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const finalAmount = customAmount || amount;
  //   console.log({ finalAmount, frequency, endDate, designation });
  //   navigate("/register");
  // };

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

    if (name === "donationType") {
      if (value === "money") {
        setFormData((prev) => ({ ...prev, amount: "" }));
      } else if (value === "items") {
        setAmount("");
        setCustomAmount("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalAmount = customAmount || amount;
    console.log({ finalAmount, frequency, endDate, designation });
    // navigate("/register");

    setIsLoading(true);
    setShowBanner(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Donation submitted:", formData);
    }, 2000);
  };


  return (
    <div>
      <NotificationBanner
        floating
        onClose={() => setShowBanner(false)}
        show={showBanner}
        message="Thank you for your donation!"
      />

      <div className="card shadow-sm my-lg-4 bg-dark text-white">
        <div className="donate-form-container">
          <div className="login-form-header">
            <h3>Donate Now</h3>
            <p>Choose how you’d like to support us</p>
          </div>

          <form className="donation-form" onSubmit={handleSubmit}>
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
            {formData.donationType !== "money" && (
              <div className="form-group">
                <label htmlFor="amount">Items Description</label>
                <textarea
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 2 bags of dog food, Dog beds... "
                  className="form-input"
                />
              </div>
            )}
            <fieldset className="preset-buttons">
              <legend>Donation Amount</legend>
              {[25, 50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`amount-btn ${
                    amount === String(val) ? "selected" : ""
                  }`}
                  onClick={() => {
                    setAmount(String(val));
                    setCustomAmount("");
                  }}
                >
                  ${val}
                </button>
              ))}

              <div
                className={`custom-amount-wrapper ${
                  isFocused ? "focused" : ""
                }`}
              >
                <span className="dollar-prefix">$</span>
                <input
                  className="custom-amount-input"
                  type="number"
                  inputMode="numeric"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  // pattern="[0-9]*"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount("");
                  }}
                />
              </div>
            </fieldset>

            <div className="form-row-donate">
              <div className="form-group">
                <label htmlFor="recurring_donation_period">
                  Select Donation Frequency
                </label>
                <select
                  id="recurring_donation_period"
                  className="form-control"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="">-- Select Frequency --</option>
                  <option value="one_time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annually">Semiannually</option>
                  <option value="annually">Annually</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="recurring_donation_end_date">
                  Ending (Optional)
                </label>
                <input
                  id="recurring_donation_end_date"
                  className="form-control"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="donation_designation_id">Select</label>
              <select
                id="donation_designation_id"
                className="form-control"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Please select...</option>
                <option value="34389">General Donation</option>
                <option value="85917">
                  Pledges for BARC Euthanasia List Saves 2025
                </option>
              </select>
            </div>
            <div className="donate-button-wrapper">
              <button
                type="submit"
                disabled={isLoading}
                className={`login-button-donate ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : formData.donationType === "items" ? (
                  "Donate Items"
                ) : (
                  `Donate ${
                    frequency === "one_time"
                      ? "Once"
                      : frequency === "monthly"
                      ? "Monthly"
                      : frequency === "quarterly"
                      ? "Quarterly"
                      : frequency === "semi-annually"
                      ? "Semiannually"
                      : frequency === "annually"
                      ? "Annually"
                      : frequency === "weekly"
                      ? "Weekly"
                      : ""
                  }`
                )}
              </button>
            </div>
            <div className="login-footer">
              <p className="back-home">
                <Link to="/" className="home-link">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <section className="info">
        <div className="bg-white">
          <section className="py-2 py-sm-4 border-top">
            <div className="container">
              <div className="row">
                <div className="mt-4 col-12">
                  <h3 className="mb-3">
                    Give Hope, Save Lives: Support Hope Paws Today
                  </h3>
                  <div className="campaign-description">
                    <p>
                      Every day, countless stray, abandoned, and forgotten
                      animals wander the streets—left without care, shelter, or
                      hope. Without intervention, many end up in overcrowded
                      shelters, facing euthanasia simply because there's no room
                      left. With your help that all can change.
                    </p>

                    <p>
                      <strong>
                        That's where Hope Paws steps in and takes action.
                      </strong>
                    </p>

                    <p>
                      Since 2010, Hope Paws has served as a lifeline for
                      vulnerable animals—rescuing, rehabilitating, and
                      relocating them to regions where adoptable pets are in
                      high demand. There, they’re welcomed into loving homes and
                      given a chance at a brighter future and given so much
                      love. We've already saved over 
                      <strong>52,000 lives</strong>,  and we’re not stopping.
                    </p>

                    <p>
                      <strong>
                        <u>Why Your Support Matters:</u>
                      </strong>
                    </p>

                    <p>
                      Communities everywhere are struggling with overwhelming
                      pet overpopulation. While some families are ready to
                      adopt, far too many dogs, cats, puppies, and kittens are
                      left behind—vastly outnumbered and running out of time.
                    </p>

                    <p>
                      Hope Paws steps in to close that gap, your support helps
                      fund:
                    </p>
                    <ul>
                      <li>
                        <strong>Critical veterinary care</strong> to get pets
                        healthy and ready for adoption
                      </li>
                      <li>
                        <strong>Safe, loving foster homes and boarding</strong>{" "}
                        while they wait for transport
                      </li>
                      <li>
                        <strong>Essential supplies</strong> like crates, food,
                        bedding, collars, and medications
                      </li>
                      <li>
                        <strong>Transport</strong> on our fleet of vans to
                        trusted rescue partners across the U.S.
                      </li>
                    </ul>

                    <p>
                      <strong>
                        Unlike many national groups, Hope Paw's funding isn't
                        guaranteed. We operate solely because of your support.
                      </strong>
                    </p>

                    <p>
                      <strong>
                        <u>Turning Compassion Into Action:</u>
                      </strong>
                    </p>

                    <p>
                      It costs <strong>over $400 per animal</strong> to cover
                      core expenses like veterinary care, medications, food,
                      temporary shelter, and transport. Behind every life saved
                      is a team working tirelessly to provide care, structure,
                      and support.
                    </p>

                    <p>
                      Your support empowers our 
                      <strong>animal care team</strong> to provide daily
                      nourishment, enrichment, and compassionate attention to
                      hundreds of animals. It also helps sustain our 
                      <strong>on-site medical clinic</strong>, where pets
                      receive vital treatments, vaccinations, and preparation
                      for their journey to a new life.
                    </p>

                    <p>
                      Our <strong>rescue coordination team</strong> carefully
                      matches pets to our 40+ trusted partners across the
                      country, and our <strong>foster team</strong> ensures
                      temporary homes are supported with training, supplies, and
                      24/7 guidance.
                    </p>

                    <p>
                      Hope Paws also shoulders key operational expenses—from
                      keeping our transport vans in top condition to supplying
                      animals with food, crates, bedding, and cleaning materials
                      essential for their comfort and care.
                    </p>

                    <p>
                      <em>
                        Hope Paws operates differently than many rescues—we
                        don’t oversee the adoption process ourselves. Instead,
                        we work with trusted partners who find forever homes for
                        the animals, which means 
                        <strong>we don’t receive any adoption fees</strong>.
                        Your donation is what makes every rescue journey
                        possible from start to finish.
                      </em>
                    </p>

                    <p>Every donation you give:</p>
                    <ul>
                      <li>
                        <strong>Saves a life</strong> at risk of euthanasia
                      </li>
                      <li>
                        <strong>Funds essential care</strong> and rehabilitation
                      </li>
                      <li>
                        <strong>Provides hope</strong> where there was none
                      </li>
                    </ul>

                    <p>
                      <strong>
                        <em>
                          You’re not just making a donation—you’re giving an
                          animal a their life back.
                        </em>
                      </strong>
                    </p>

                    <p>
                      <strong>Why Hope Paws?</strong>
                    </p>
                    <ul>
                      <li>
                        <strong>
                          Largest rescue transport group of its kind in the U.S.
                        </strong>
                      </li>
                      <li>
                        <strong>Over 50,000 animals saved.</strong>
                      </li>
                      <li>
                        <strong>
                          Setting the standard for humane animal transport and
                          care
                        </strong>
                      </li>
                    </ul>

                    <p>
                      <em>
                        But none of this is possible without contributors like
                        you.
                      </em>
                    </p>

                    <p>
                      <strong>Join the Movement:</strong>
                    </p>
                    <p>
                      Each rescue brings a new chance at life—and helps complete
                      another family.
                    </p>
                    <p>
                      <strong>
                        Give today—your donation is tax-deductible!
                      </strong>
                    </p>
                    <p>
                      Together, we can make a lasting impact—one life, one
                      chance, one change at a time.
                    </p>
                    <p>
                      <strong>
                        <em style={{ fontSize: "20px" }}>
                          Donate now. Save a life.
                        </em>
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default DonatePage;
