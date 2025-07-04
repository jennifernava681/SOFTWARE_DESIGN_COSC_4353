import React from "react";
import "../../css/SubmitAdoptionRequest.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/adoption-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Adoption request submitted successfully!");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="adoption-container">
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
              onChange={(e) => setFormData({ ...formData, household: e.target.value})}
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
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value})}
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
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value})}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value})}
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
                onChange={(e) => setFormData({ ...formData, phone: e.target.value})}
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
              onChange={(e) => setFormData({ ...formData, address: e.target.value})}
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
              onChange={(e) => setFormData({ ...formData, experience: e.target.value})}
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
              onChange={(e) => setFormData({ ...formData, interest: e.target.value})}
              rows="4"
              className="inInterest"
            ></textarea>
          </div>
          <div className="button-group">
            <button type="submit" className="action-button" variant="outline">
              Make an Adoption Request
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default SubmitAdoptionRequest
