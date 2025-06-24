import React, { useState, useEffect } from "react";
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

  const [requestLetters, setRequestLetters] = useState([{ file: null, preview: null }]);
  const [siteImages, setSiteImages] = useState([{ file: null, preview: null }]);

  const [estimationRows, setEstimationRows] = useState([
    { item: "", description: "", quantity: "", rate: "", subtotal: 0 },
  ]);
  const [totalEstimate, setTotalEstimate] = useState(0);

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup image preview URLs to prevent memory leaks
      siteImages.forEach(entry => {
        if (entry.preview) {
          URL.revokeObjectURL(entry.preview);
        }
      });
    };
  }, []);

  // File/Image handlers
  const updateRequestLetters = (index, file) => {
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file for request letters.');
        return;
      }

      setRequestLetters(prev => {
        const updated = [...prev];
        
        // Clean up old preview URL if it exists
        if (updated[index] && updated[index].preview) {
          URL.revokeObjectURL(updated[index].preview);
        }

        updated[index] = { file, preview: null }; // PDFs don't need preview
        console.log(`Request letter updated at index ${index}:`, file.name, file.size, file.type);
        return updated;
      });
    }
  };

  const updateSiteImages = (index, file) => {
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.) for site images.');
        return;
      }

      setSiteImages(prev => {
        const updated = [...prev];
        
        // Clean up old preview URL if it exists
        if (updated[index] && updated[index].preview) {
          URL.revokeObjectURL(updated[index].preview);
        }

        // Create preview for images
        const preview = URL.createObjectURL(file);
        updated[index] = { file, preview };
        console.log(`Site image updated at index ${index}:`, file.name, file.size, file.type);
        return updated;
      });
    }
  };

  const addRequestLetter = () => {
    setRequestLetters(prev => [...prev, { file: null, preview: null }]);
  };

  const addSiteImage = () => {
    setSiteImages(prev => [...prev, { file: null, preview: null }]);
  };

  const removeRequestLetter = (index) => {
    setRequestLetters(prev => {
      // Clean up preview URL if it exists
      if (prev[index] && prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      
      const updated = prev.filter((_, i) => i !== index);
      // Ensure we always have at least one field
      if (updated.length === 0) {
        return [{ file: null, preview: null }];
      }
      return updated;
    });
  };

  const removeSiteImage = (index) => {
    setSiteImages(prev => {
      // Clean up preview URL if it exists
      if (prev[index] && prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      
      const updated = prev.filter((_, i) => i !== index);
      // Ensure we always have at least one field
      if (updated.length === 0) {
        return [{ file: null, preview: null }];
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
        setIsSubmitting(true);
        // Calculate total before submission
        calculateTotal();
        
        // Check if we have files to upload
        const hasFiles = requestLetters.some(entry => entry.file) || siteImages.some(entry => entry.file);
        
        let response;
        
        if (hasFiles) {
          // Create FormData for file upload
          const formData = new FormData();
          
          // Add text data
          formData.append('projectName', projectName);
          formData.append('location', projectArea);
          formData.append('status', 'PENDING');
          formData.append('workflowStep', '1');
          formData.append('additionalNotes', additionalNotes);
          formData.append('estimation', JSON.stringify(estimationRows));
          formData.append('totalEstimate', parseFloat(totalEstimate) || 0);
          formData.append('natureOfWork', natureOfWork);
          formData.append('startDate', startDate);
          formData.append('comment', purpose);
          
          // Add request letters
          requestLetters.forEach((entry, index) => {
            if (entry.file) {
              formData.append(`requestLetter_${index}`, entry.file);
            }
          });
          
          // Add site images
          siteImages.forEach((entry, index) => {
            if (entry.file) {
              formData.append(`siteImage_${index}`, entry.file);
            }
          });
          
          console.log("Submitting form data with files using FormData");
          console.log("FormData contents:");
          for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
              console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
            } else {
              console.log(`${key}:`, value);
            }
          }
          
          // Log the request details
          console.log("Request details:", {
            url: 'http://localhost:8808/api/createFlow',
            method: 'POST',
            hasFiles: hasFiles,
            fileCount: {
              requestLetters: requestLetters.filter(entry => entry.file).length,
              siteImages: siteImages.filter(entry => entry.file).length
            }
          });
          
          try {
            response = await axios.post('http://localhost:8808/api/createFlow', formData, {
              withCredentials: true,
            });
          } catch (formDataError) {
            console.error("FormData submission failed:", formDataError);
            console.error("FormData error details:", {
              status: formDataError.response?.status,
              statusText: formDataError.response?.statusText,
              data: formDataError.response?.data,
              headers: formDataError.response?.headers,
              message: formDataError.message
            });
            
            if (formDataError.response?.status === 415) {
              console.log("Server doesn't support FormData, trying JSON with base64 files...");
              
              // Fallback: Convert files to base64 and send as JSON
              const requestDataWithFiles = {
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
                requestLetters: [],
                siteImages: []
              };
              
              // Convert request letters to base64
              for (let i = 0; i < requestLetters.length; i++) {
                const entry = requestLetters[i];
                if (entry.file) {
                  const base64 = await fileToBase64(entry.file);
                  requestDataWithFiles.requestLetters.push({
                    name: entry.file.name,
                    type: entry.file.type,
                    size: entry.file.size,
                    data: base64
                  });
                }
              }
              
              // Convert site images to base64
              for (let i = 0; i < siteImages.length; i++) {
                const entry = siteImages[i];
                if (entry.file) {
                  const base64 = await fileToBase64(entry.file);
                  requestDataWithFiles.siteImages.push({
                    name: entry.file.name,
                    type: entry.file.type,
                    size: entry.file.size,
                    data: base64
                  });
                }
              }
              
              console.log("Submitting as JSON with base64 files");
              console.log("JSON payload size:", JSON.stringify(requestDataWithFiles).length, "characters");
              
              try {
                response = await axios.post('http://localhost:8808/api/createFlow-json', requestDataWithFiles, {
                  headers: { 'Content-Type': 'application/json' },
                  withCredentials: true,
                });
              } catch (jsonError) {
                console.error("JSON submission also failed:", jsonError);
                console.error("JSON error details:", {
                  status: jsonError.response?.status,
                  statusText: jsonError.response?.statusText,
                  data: jsonError.response?.data,
                  headers: jsonError.response?.headers,
                  message: jsonError.message
                });
                throw jsonError;
              }
            } else {
              throw formDataError;
            }
          }
        } else {
          // Send as JSON if no files
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

          console.log("Submitting form data as JSON:", requestData);

          response = await axios.post('http://localhost:8808/api/createFlow-json', requestData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          });
        }

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
      } finally {
        setIsSubmitting(false);
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
      console.error("Test submission error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        message: err.message
      });
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
            <h3>Upload Request Letters (PDF files only)</h3>
            <p style={{color: '#666', marginBottom: '20px'}}>Upload PDF files for request letters. Maximum file size: 10MB per file.</p>
            {requestLetters.map((entry, i) => (
              <div key={i} className="file-upload-container">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => updateRequestLetters(i, e.target.files[0])} 
                />
                {entry.file && (
                  <div className="file-info">
                    <span>📄 {entry.file.name}</span>
                    <span>{(entry.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
                <button onClick={() => removeRequestLetter(i)}>✕</button>
              </div>
            ))}
            <button className="btn" onClick={addRequestLetter}>Add Letter</button>
          </div>
        );
      case "site-images":
        return (
          <div className="page-content">
            <h3>Upload Site Images</h3>
            <p style={{color: '#666', marginBottom: '20px'}}>Upload images of the project site. Supported formats: JPG, PNG, GIF. Maximum file size: 10MB per image.</p>
            {siteImages.map((entry, i) => (
              <div key={i} className="file-upload-container">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => updateSiteImages(i, e.target.files[0])} 
                />
                {entry.file && (
                  <div className="file-info">
                    <span>🖼️ {entry.file.name}</span>
                    <span>{(entry.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
                {entry.preview && (
                  <div className="image-preview">
                    <img src={entry.preview} alt="Preview" />
                  </div>
                )}
                <button onClick={() => removeSiteImage(i)}>✕</button>
              </div>
            ))}
            <button className="btn" onClick={addSiteImage}>Add Image</button>
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
          <button className="btn discard" onClick={() => navigate(-1)} disabled={isSubmitting}>Discard</button>
          <button className="btn submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save & Submit'}
          </button>
          <button className="btn draft" onClick={handleSaveDraft} disabled={isSubmitting}>Save Draft</button>
          <button className="btn test" onClick={testSubmission} style={{backgroundColor: '#ffc107', color: '#000'}} disabled={isSubmitting}>Test Submit (No Files)</button>
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
