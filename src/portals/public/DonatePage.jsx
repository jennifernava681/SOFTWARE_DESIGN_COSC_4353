import "../../css/DonatePage.css"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from 'react-router-dom';

// Proper Paw Print Icon that matches the design
function PawIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      {/* Main paw pad */}
      <ellipse cx="12" cy="16" rx="4" ry="3" />
      {/* Top left toe pad */}
      <circle cx="8" cy="10" r="1.5" />
      {/* Top center toe pad */}
      <circle cx="12" cy="8" r="1.5" />
      {/* Top right toe pad */}
      <circle cx="16" cy="10" r="1.5" />
      {/* Side toe pad */}
      <circle cx="18" cy="13" r="1.2" />
    </svg>
  )
}

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
  </svg>
)

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10.5V11.5C15.4 11.5 16 12.4 16 13V16C16 17.4 15.4 18 14.8 18H9.2C8.6 18 8 17.4 8 16V13C8 12.4 8.6 11.5 9.2 11.5V10.5C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.5 8.7 10.5 10.5V11.5H13.5V10.5C13.5 8.7 12.8 8.2 12 8.2Z" />
  </svg>
)

const MenuIcon = () => (
  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

function DonatePage() {

  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [endDate, setEndDate] = useState('');
  const [designation, setDesignation] = useState('');

  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = customAmount || amount;
    console.log({ finalAmount, frequency, endDate, designation });
    navigate('/register');
  };

  return (
    <div>
      <div className="card shadow-sm my-lg-4 bg-dark text-white">
        <div className="donate-form-container">
          <h1
            className="donate-form-header"
            aria-label="Your donation saves lives!"
            tabIndex="0"
          >
            Your donation saves lives!
          </h1>

          <form className="donation-form" onSubmit={handleSubmit}>
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

            <div className="form-row">
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

            <button
              type="submit"
              className="btn btn-primary btn-block rounded-pill"
            >
              Donate{" "}
              {frequency === "one_time"
                ? "Once"
                : frequency === "monthly"
                ? "Monthly"
                : frequency === "quarterly"
                ? "Quarterly"
                : frequency === "semi_annually"
                ? "Semiannually"
                : frequency === "annually"
                ? "Annually"
                : frequency === "weekly"
                ? "Weekly"
                : ""}
            </button>
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

export default DonatePage