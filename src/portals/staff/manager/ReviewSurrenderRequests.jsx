import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../api.js";
import "../../../css/ReviewSurrenderRequests.css";
import NotificationBanner from "../../../NotificationBanner.jsx";

function ReviewSurrenderRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSurrenderRequests = async () => {
      try {
        const data = await apiFetch("/api/surrender", "GET");
        setRequests(data);
      } catch (err) {
        console.error("Error fetching surrender requests:", err);
        setError("Failed to load surrender requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurrenderRequests();
  }, []);

  if (loading) return <p>Loading surrender requests...</p>;
  if (error) return <NotificationBanner show message={error} />;

  if (requests.length === 0) {
    return <p>No pending surrender requests at this time.</p>;
  }

  return (
    <div className="review-surrender-container">
      <h2>Pending Surrender Requests</h2>
      <table className="surrender-table">
        <thead>
          <tr>
            <th>Animal</th>
            <th>Type</th>
            <th>Breed</th>
            <th>Urgency</th>
            <th>Reason</th>
            <th>Description</th>
            <th>Surrendered By</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id_surrender}>
              <td>{req.animalName}</td>
              <td>{req.animalType}</td>
              <td>{req.breed}</td>
              <td>{req.urgency}</td>
              <td>{req.reason}</td>
              <td>{req.animal_description}</td>
              <td>{req.user_id}</td>{" "}
              {/* You can join with users table to show name */}
              <td>{new Date(req.surrender_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewSurrenderRequests;
