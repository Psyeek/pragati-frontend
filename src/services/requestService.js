import axios from "axios";

const API = "http://localhost:8808/api"; // Your backend base URL

axios.defaults.withCredentials = true; // Always send cookies

// Create a new request
export const createRequest = async (requestData) => {
  try {
    let config = {
      withCredentials: true,
    };

    // Check if requestData is FormData
    if (requestData instanceof FormData) {
      // For FormData, don't set Content-Type - let browser handle it
      console.log("Sending FormData with files");
      
      // Log the FormData entries for debugging
      console.log("FormData entries:");
      for (let [key, value] of requestData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes, type: ${value.type})`);
        } else {
          console.log(`${key}:`, value);
        }
      }
    } else {
      // For JSON data, set Content-Type
      config.headers = {
        'Content-Type': 'application/json',
      };
      console.log("Sending JSON data");
    }
    
    console.log("Request config:", config);
    console.log("Request data type:", requestData instanceof FormData ? "FormData" : "JSON");
    console.log("API endpoint:", `${API}/createFlow`);
    
    const response = await axios.post(`${API}/createFlow`, requestData, config);
    console.log("Response received:", response);
    return response.data;
  } catch (error) {
    console.error("Request creation failed:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    console.error("Error headers:", error.response?.headers);
    
    // If it's a 415 error, try to provide more specific guidance
    if (error.response?.status === 415) {
      console.error("415 Unsupported Media Type - This usually means:");
      console.error("1. The server doesn't support multipart/form-data");
      console.error("2. The Content-Type header is incorrect");
      console.error("3. The server expects a different data format");
    }
    
    throw error;
  }
};

export const fetchMyRequests = async () => {
  try {
    console.log("Fetching my requests from:", `${API}/requests`);
    const response = await axios.get(`${API}/requests`, {
      withCredentials: true,
    });
    console.log("My requests response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my requests:", error);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return [];
  }
};

export const fetchAllRequests = async () => {
  try {
    console.log("Fetching all requests from:", `${API}/all-requests`);
    const response = await axios.get(`${API}/all-requests`, {
      withCredentials: true,
    });
    console.log("All requests response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all requests:", error);
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return [];
  }
};



// (Optional) Update an existing request
export const updateRequest = async (updateData) => {
  try {
    const response = await axios.post(`${API}/updateFlow`, updateData);
    return response.data;
  } catch (error) {
    console.error("Request update failed:", error?.response?.data || error.message);
    throw error;
  }
};
