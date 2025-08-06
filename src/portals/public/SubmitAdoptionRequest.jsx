import React from "react";
import { useState, useEffect } from "react";
import "../../css/SubmitAdoptionRequest.css";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api";
import NotificationBanner from "../../NotificationBanner";

function SubmitAdoptionRequest() {
  const [formData, setFormData] = useState({
    household: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    experience: "",
    interest: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowBanner(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBannerMessage("Please log in to submit an adoption request.");
        setShowBanner(true);
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const adoptionData = {
        request_date: new Date().toISOString(),
        USERS_id_user: user.id_user,
        USERS_adrees_idadrees_id: 1, // Replace with actual address ID if available
        USERS_adrees_state_state_id: 1, // Replace with actual state ID if available
        animal_id: 1, // This should come from parent component or page context
        reason: formData.interest || "", // Optional field for backend
      };

      const response = await apiFetch("/api/adoptions", "POST", adoptionData);
      
      setBannerMessage("Adoption request submitted successfully! We'll contact you soon.");
      setShowBanner(true);
      
      setFormData({
        household: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        serviceType: "",
        experience: "",
        interest: "",
      });
    } catch (error) {
      console.error("Adoption request error:", error);
      setBannerMessage("Failed to submit adoption request. Please try again.");
      setShowBanner(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="adoption-container">
      <NotificationBanner
        floating
        onClose={() => setShowBanner(false)}
        show={showBanner}
        message={bannerMessage}
      />
            
      <div
        className="hero-image"
        style={{
          backgroundImage: "url('/images/animals/dog-eyes.png')",
        }}
      />
      <section className="info-section">
        <h2 className="info-header">Thinking of Adopting?</h2>
        <p>
          Here at Hope Paws, we take in approximately 5,500 - 9,000 animals per
          year. We have a wide variety of amazing dogs and cats available for
          adoption.
        </p>
        <p>
          The adoption fee includes spay or neuter surgery, a microchip, and age
          appropriate vaccinations, including rabies.
        </p>
        <p>
          Adoptions must be done in person by coming to our shelter. We do not
          place holds over the phone, email, etc.
        </p>
        <p>
          <strong>Adoption Hours:</strong>
        </p>
        <ul className="adoption-hours">
          <li>Monday - Friday: 1 pm - 5:30 pm</li>
          <li>Saturday and Sunday: 11 am - 3:30 pm</li>
        </ul>
        <p>
          Adoptions are on a first come, first serve basis. Animals that are
          spayed or neutered can leave the shelter that same day. Animals that
          still need to be spayed or neutered must stay until surgery can be
          completed. We do not adopt out unaltered animals.
        </p>
      </section>
      <div className="button-group">
        <Link to="/animals" className="button-no-style">
          <button className="browse-animals">Search for Animals</button>
        </Link>
      </div>

      {/* Adoption Fee Table */}
      <section className="fee-table-section">
        <h3 className="table-header">Adoption Fees</h3>
        <div className="table-wrapper">
          <table className="fee-table">
            <thead className="table-titles">
              <tr>
                <th className="theader">Type of Pet</th>
                <th className="theader">Adoption Fee</th>
                <th className="theader">
                  Senior (60+ yrs) / Military Adoption Fee
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-border">
                <td className="tdata">Puppy</td>
                <td className="tdata">$80.00</td>
                <td className="tdata">$40.00</td>
              </tr>
              <tr className="row-border">
                <td className="tdata">Dog</td>
                <td className="tdata">$50.00</td>
                <td className="tdata">$25.00</td>
              </tr>
              <tr className="row-border">
                <td className="tdata">Kitten</td>
                <td className="tdata">$35.00</td>
                <td className="tdata">$20.00</td>
              </tr>
              <tr className="row-border">
                <td className="tdata">Cat</td>
                <td className="tdata">$20.00</td>
                <td className="tdata">$20.00</td>
              </tr>
              <tr className="row-border">
                <td className="tdata">Dogs over 5 years old</td>
                <td className="tdata">$20.00</td>
                <td className="tdata">-</td>
              </tr>
              <tr className="row-border">
                <td className="tdata">Cats over 5 years old</td>
                <td className="tdata">$10.00</td>
                <td className="tdata">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Adoption Request Form */}
      <section className="adoption-form">
        <h3 className="form-adoption-head">Adoption Request Form</h3>
        <form onSubmit={handleSubmit} className="form-adoption-request">
          <div>
            <label htmlFor="household" className="labelHouse">
              Number of people in your household
            </label>
            <input
              type="number"
              id="household"
              name="household"
              min="0"
              value={formData.household}
              onChange={handleInputChange}
              className="household"
            />
          </div>
          <div className="name">
            <div>
              <label htmlFor="firstName" className="fName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="inName"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="lName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="inName"
                required
              />
            </div>
          </div>
          <div className="emailAddress">
            <div>
              <label htmlFor="email" className="labelEmail">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="inEmail"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="labelPhone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="inPhone"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="labelAddress">
              Home Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="inAddress"
              required
            />
          </div>
          <div>
            <label className="labelService">Type of Service</label>
            <div className="service-buttons-wrapper">
              <button type="button" className={`pet-btn ${formData.serviceType === "cat" ? "selected" : ""}`}
               onClick={() => setFormData({ ...formData, serviceType: "cat"})}>
                Cat/Kitten
              </button>
              <button type="button" className={`pet-btn ${formData.serviceType === "dog" ? "selected" : ""}`}
              onClick={() => setFormData({ ...formData, serviceType: "dog"})}>
                Dog/Puppy
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="experience" className="labelExperience">
              Tell us about your experience with pets and your lifestyle
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              rows="4"
              className="inExperience"
            ></textarea>
          </div>
          <div>
            <label htmlFor="interest" className="labelInterest">
              Why are you interested in adopting?
            </label>
            <textarea
              id="interest"
              name="interest"
              value={formData.interest}
              onChange={handleInputChange}
              rows="4"
              className="inInterest"
            ></textarea>
          </div>
          <div className="button-group">
            <button type="submit" className="action-button" variant="outline" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Make an Adoption Request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default SubmitAdoptionRequest;