import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser, getSessionUser } from "../services/authService";
import { fetchAllRequests, fetchMyRequests } from "../services/requestService";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [motivationalText, setMotivationalText] = useState("");
  const [firstName, setFirstName] = useState("User");

  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const motivationalQuotes = [
    "Serving the Nation, One Step at a Time!",
    "Your Efforts Build the Future of India!",
    "Together We Drive Progress!",
    "Making India Stronger, Every Day!",
    "Public Service is a Noble Duty!",
    "Your Hard Work is India's Growth!",
  ];

  useEffect(() => {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setMotivationalText(quote);

    getSessionUser().then((name) => {
      if (name) setFirstName(name);
    });

    // Fetch requests with loading state
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Starting to fetch requests...");
        
        const [myRequestsData, allRequestsData] = await Promise.all([
          fetchMyRequests(),
          fetchAllRequests()
        ]);
        
        console.log("Fetched my requests:", myRequestsData);
        console.log("Fetched all requests:", allRequestsData);
        
        setMyRequests(Array.isArray(myRequestsData) ? myRequestsData : []);
        setAllRequests(Array.isArray(allRequestsData) ? allRequestsData : []);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try refreshing the page.");
        setMyRequests([]);
        setAllRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.profile-container')) {
        setDropdownVisible(false);
      }
    }
    if (dropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);


  const renderRequestDetails = (request) => {
    if (!request) return null;
    let estimation = [];
    try {
      if (request.estimation) {
        estimation = typeof request.estimation === 'string' ? JSON.parse(request.estimation) : request.estimation;
      }
    } catch (e) {
      estimation = [];
    }

    // Calculate total from estimation array if totalEstimate is not available
    const calculatedTotal = estimation.reduce((sum, row) => sum + (parseFloat(row.subtotal) || 0), 0);
    const totalToShow = request.totalEstimate || calculatedTotal;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
          <h2>Request Details</h2>
          <div className="details-list">
            <div><strong>Request No.:</strong> {request.requestId}</div>
            <div><strong>Project Name:</strong> {request.projectName}</div>
            {request.location && <div><strong>Project Area:</strong> {request.location}</div>}
            {request.natureOfWork && <div><strong>Nature of Work:</strong> {request.natureOfWork}</div>}
            <div><strong>Status:</strong> {request.status}</div>
            <div><strong>Created At:</strong> {request.createdTs ? new Date(request.createdTs).toLocaleString() : ''}</div>
            {request.createdBy && <div><strong>Created By:</strong> {request.createdBy}</div>}
            {request.comment && <div><strong>Purpose:</strong> {request.comment}</div>}
            {request.additionalNotes && <div><strong>Additional Notes:</strong> {request.additionalNotes}</div>}
          </div>
          {estimation && Array.isArray(estimation) && estimation.length > 0 && (
            <div style={{marginTop: '1em'}}>
              <strong>Estimation:</strong>
              <table className="estimation-table" style={{width: '100%', marginTop: '0.5em'}}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {estimation.map((row, i) => (
                    <tr key={i}>
                      <td>{row.item}</td>
                      <td>{row.description}</td>
                      <td>{row.quantity}</td>
                      <td>{row.rate}</td>
                      <td>{row.subtotal}</td>
                    </tr>
                  ))}
                  <tr style={{fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>
                    <td colSpan="4" style={{textAlign: 'right'}}>Total Estimate:</td>
                    <td>₹{totalToShow.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div style={{display:'flex', justifyContent:'flex-end', gap:'1em', marginTop:'2em'}}>
            <button className="btn" style={{background:'#4caf50', color:'white'}} onClick={() => alert('Project Approved!')}>Approve</button>
            <button className="btn" style={{background:'#f44336', color:'white'}} onClick={() => alert('Project Rejected!')}>Reject</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        PRAGATI
        <div className="motivational-text">{motivationalText}</div>
        <div className="profile-container">
        <button className="profile-btn" onClick={() => setDropdownVisible(!dropdownVisible)}>
          <img
            src="https://pbs.twimg.com/profile_images/1607576872589889537/mQxBneCJ_400x400.jpg"
            alt="Profile"
            className="profile-img"
          />
          <span>Mr. {firstName}</span>
          <span className="arrow">&#x25BE;</span> {/* Unicode for downward arrow */}
        </button>
          {dropdownVisible && (
            <div className="dropdown">
              <button onClick={() => navigate("/settings")}>My Profile & Settings</button>
              <button
                className="btn"
                style={{ background: "#f44336", color: "white" }}
                onClick={() => {
                  logoutUser();
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Buttons */}
      <div className="button-container">
        <button className="btn top-action-btn" onClick={() => navigate("/create-request")}> 
          + Create New Request
        </button>
        <button className="btn top-action-btn" onClick={() => navigate("/history")}> 
          📜 History
        </button>
        {/* <button
          className="btn"
          style={{ background: "#f44336", color: "white" }}
          onClick={() => {
            logoutUser();
            logout();
            navigate("/");
          }}
        >
          Logout
        </button> */}
      </div>

      {/* Main Content */}
      <div className="content">
        {/* My Requests Table */}
        <div className="table-container">
          <h2>My Requests</h2>
          <div className="scrollable-table">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading requests...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#f44336' }}>
                {error}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Request No.</th>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    myRequests.map((r) => (
                      <tr key={r.requestId} style={{cursor:'pointer'}} onClick={() => { setSelectedRequest(r); setShowModal(true); }}>
                        <td>{r.requestId}</td>
                        <td>{r.projectName}</td>
                        <td>{r.status}</td>
                        <td>{new Date(r.createdTs).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* All Requests Table */}
        <div className="table-container">
          <h2>All Requests (Everyone)</h2>
          <div className="scrollable-table">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading requests...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#f44336' }}>
                {error}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Request No.</th>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    allRequests.map((r) => (
                      <tr key={r.requestId} style={{cursor:'pointer'}} onClick={() => { setSelectedRequest(r); setShowModal(true); }}>
                        <td>{r.requestId}</td>
                        <td>{r.projectName}</td>
                        <td>{r.status}</td>
                        <td>{new Date(r.createdTs).toLocaleDateString()}</td>
                        <td>{r.createdBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showModal && renderRequestDetails(selectedRequest)}
    </div>
  );
};

export default Dashboard;
