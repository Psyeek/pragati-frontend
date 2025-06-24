import React, { useState } from "react";
import "../styles/CreateRequest.css";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../services/requestService";
import axios from "axios";

const CreateRequest = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("project-details");

  // Form fields
  const [projectName, setProjectName] = useState("");
  const [projectArea, setProjectArea] = useState("");
  const [natureOfWork, setNatureOfWork] = useState("");
  const [startDate, setStartDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [requestLetters, setRequestLetters] = useState([{ file: null }]);
  const [siteImages, setSiteImages] = useState([{ file: null }]);

  const [estimationRows, setEstimationRows] = useState([
    { item: "", description: "", quantity: "", rate: "", subtotal: 0 },
  ]);
  const [totalEstimate, setTotalEstimate] = useState(0);

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // File/Image handlers
  const updateFiles = (setState, index, file) => {
    if (file) {
      const updated = [...setState];
      updated[index].file = file;
      setState(updated);
      console.log(`File updated at index ${index}:`, file.name, file.size);
    }
  };

  const addField = (setState) => {
    setState((prev) => [...prev, { file: null }]);
  };

  const removeField = (setState, index) => {
    setState((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure we always have at least one field
      if (updated.length === 0) {
        return [{ file: null }];
      }
      return updated;
    });
  };

  // Estimation handlers
  const updateEstimation = (index, field, value) => {
    const updated = [...estimationRows];
    updated[index][field] = value;
    const qty = parseFloat(updated[index].quantity) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    updated[index].subtotal = qty * rate;
    setEstimationRows(updated);
  };

  const addEstimationRow = () => {
    setEstimationRows([...estimationRows, { item: "", description: "", quantity: "", rate: "", subtotal: 0 }]);
  };

  const removeEstimationRow = (index) => {
    const updated = [...estimationRows];
    updated.splice(index, 1);
    setEstimationRows(updated);
  };

  const calculateTotal = () => {
    const total = estimationRows.reduce((acc, row) => acc + (Number(row.subtotal) || 0), 0);
    setTotalEstimate(total.toFixed(2));
  };
  

  // Form submission
  const handleSubmit = () => {
    // Validate required fields
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!projectArea.trim()) {
      alert("Please enter a project area.");
      return;
    }
    if (!natureOfWork) {
      alert("Please select the nature of work.");
      return;
    }
    
    setPopupMessage("Are you sure you want to submit this request?");
    setShowPopup(true);
  };

  const confirmSubmit = async (confirmed) => {
    setShowPopup(false);
    if (confirmed) {
      try {
        // Calculate total before submission
        calculateTotal();
        
        const requestData = {
          projectName,
          location: projectArea,
          status: "PENDING",
          workflowStep: 1,
          additionalNotes,
          estimation: JSON.stringify(estimationRows),
          totalEstimate: parseFloat(totalEstimate) || 0,
          natureOfWork,
          startDate,
          comment: purpose,
        };

        // Note: File uploads are temporarily disabled for debugging the 415 error.
        // We are sending data as JSON to test the endpoint.

        console.log("Submitting form data as JSON:", requestData);

        const response = await axios.post('http://localhost:8808/api/createFlow-json', requestData, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });

        console.log("Submission successful:", response);
        setSuccessMessage("Request submitted successfully! 🎉");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        console.error("Submission error:", err);
        console.error("Error details:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
        alert(`Submission failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
    }
  };

  // Draft
  const handleSaveDraft = async () => {
    try {
      // Calculate total before saving draft
      calculateTotal();
      
      const draftData = {
        projectName,
        location: projectArea,
        status: "DRAFT",
        workflowStep: 1,
        additionalNotes,
        estimation: JSON.stringify(estimationRows),
        totalEstimate: parseFloat(totalEstimate) || 0,
        natureOfWork,
        startDate,
        comment: purpose,
      };

      // Note: File uploads are temporarily disabled.
      
      console.log("Saving draft as JSON:", draftData);

      const response = await axios.post('http://localhost:8808/api/createFlow-json', draftData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      console.log("Draft saved successfully:", response);
      alert("Draft saved successfully.");
    } catch (err) {
      console.error("Draft save error:", err);
      alert(`Draft save failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  // Test submission without files
  const testSubmission = async () => {
    try {
      // Calculate total before test submission
      calculateTotal();
      
      const testData = {
        projectName: projectName || "Test Project",
        location: projectArea || "Test Area",
        status: "PENDING",
        workflowStep: 1,
        additionalNotes: additionalNotes || "Test notes",
        estimation: JSON.stringify(estimationRows),
        totalEstimate: parseFloat(totalEstimate) || 0,
        natureOfWork: natureOfWork || "New Construction",
        startDate: startDate || "2024-01-01",
        comment: purpose || "Test purpose"
      };

      console.log("Testing submission with JSON data:", testData);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      };

      const response = await axios.post('http://localhost:8808/api/createFlow-json', testData, config);
      console.log("Test submission successful:", response);
      alert("Test submission successful! The server accepts JSON data.");
    } catch (err) {
      console.error("Test submission failed:", err);
      alert(`Test submission failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const renderSection = () => {
    switch (currentPage) {
      case "project-details":
        return (
          <div className="page-content">
            <div className="form-group">
              <label>Project Name</label>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Project Area</label>
              <input value={projectArea} onChange={(e) => setProjectArea(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nature of Work</label>
              <select value={natureOfWork} onChange={(e) => setNatureOfWork(e.target.value)}>
                <option value="">Select</option>
                <option>New Construction</option>
                <option>Repair</option>
                <option>Extension</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tentative Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
          </div>
        );
      case "request-letters":
        return (
          <div className="page-content">
            {requestLetters.map((entry, i) => (
              <div key={i} className="file-upload-container">
                <input type="file" accept="application/pdf" onChange={(e) => updateFiles(setRequestLetters, i, e.target.files[0])} disabled />
                <button onClick={() => removeField(setRequestLetters, i)}>✕</button>
              </div>
            ))}
            <button className="btn" onClick={() => addField(setRequestLetters)}>Add Letter</button>
            <p style={{color: 'orange'}}>File uploads are temporarily disabled.</p>
          </div>
        );
      case "site-images":
        return (
          <div className="page-content">
            {siteImages.map((entry, i) => (
              <div key={i} className="file-upload-container">
                <input type="file" accept="image/*" onChange={(e) => updateFiles(setSiteImages, i, e.target.files[0])} disabled />
                <button onClick={() => removeField(setSiteImages, i)}>✕</button>
              </div>
            ))}
            <button className="btn" onClick={() => addField(setSiteImages)}>Add Image</button>
            <p style={{color: 'orange'}}>File uploads are temporarily disabled.</p>
          </div>
        );
      case "project-estimation":
        return (
          <div className="page-content">
            <table className="estimation-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {estimationRows.map((row, i) => (
                  <tr key={i}>
                    <td><input value={row.item} onChange={(e) => updateEstimation(i, "item", e.target.value)} /></td>
                    <td><input value={row.description} onChange={(e) => updateEstimation(i, "description", e.target.value)} /></td>
                    <td><input type="number" value={row.quantity} onChange={(e) => updateEstimation(i, "quantity", e.target.value)} /></td>
                    <td><input type="number" value={row.rate} onChange={(e) => updateEstimation(i, "rate", e.target.value)} /></td>
                    <td><input value={row.subtotal.toFixed(2)} readOnly /></td>
                    <td><button onClick={() => removeEstimationRow(i)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn" onClick={addEstimationRow}>Add Row</button>
            <button className="btn" onClick={calculateTotal}>Generate Estimate</button>
            <div className="total-estimate">
              <strong>Total Estimate: ₹{totalEstimate}</strong>
            </div>
          </div>
        );
      case "additional-notes":
        return (
          <div className="page-content">
            <textarea rows="6" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-request-container">
      <div className="sidebar">
        <h2>PRAGATI</h2>
        <ul>
          {["project-details", "request-letters", "site-images", "project-estimation", "additional-notes"].map((page) => (
            <li key={page}>
              <a className={currentPage === page ? "active" : ""} onClick={() => setCurrentPage(page)}>
                {page
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </a>
            </li>
          ))}
        </ul>
        <div className="buttons">
          <button className="btn discard" onClick={() => navigate(-1)}>Discard</button>
          <button className="btn submit" onClick={handleSubmit}>Save & Submit</button>
          <button className="btn draft" onClick={handleSaveDraft}>Save Draft</button>
          <button className="btn test" onClick={testSubmission} style={{backgroundColor: '#ffc107', color: '#000'}}>Test Submit (No Files)</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h2>{currentPage.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</h2>
          <button className="btn go-dashboard" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
        <div className="content-area">
          {renderSection()}
        </div>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{popupMessage}</h3>
            <button className="btn submit" onClick={() => confirmSubmit(true)}>Yes</button>
            <button className="btn discard" onClick={() => confirmSubmit(false)}>No</button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-popup">
          <div className="success-popup-content">
            <div className="emoji">🎉</div>
            <h3>{successMessage}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRequest;
