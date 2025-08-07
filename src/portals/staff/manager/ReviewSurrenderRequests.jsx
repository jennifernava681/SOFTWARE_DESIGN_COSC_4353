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
            <th>Animal Type</th>
            <th>Name</th>
            <th>Breed</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Weight</th>
            <th>Description</th>
            <th>Reason</th>
            <th>Urgency</th>
            <th>Submitted</th>
            <th>Submitted By</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id_request}>
              <td>{req.animalType}</td>
              <td>{req.animalName}</td>
              <td>{req.breed || "—"}</td>
              <td>{req.age || "—"}</td>
              <td>{req.gender || "—"}</td>
              <td>{req.weight || "—"}</td>
              <td>{req.animal_description}</td>
              <td>{req.reason}</td>
              <td>{req.urgency}</td>
              <td>
                {req.surrender_date
                  ? new Date(req.surrender_date).toLocaleDateString()
                  : "—"}
              </td>
              <td>
                {req.user_name} ({req.user_email})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewSurrenderRequests;
