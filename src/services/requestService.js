import axios from "axios";

const API = "http://localhost:8808/api"; // Your backend base URL

axios.defaults.withCredentials = true; // Always send cookies

export const createRequest = async (requestData) => {
  try {
    let config = {
      withCredentials: true,
    };

    let endpoint = `${API}/createFlow`;

    if (requestData instanceof FormData) {
      console.log("Sending FormData with files");
      for (let [key, value] of requestData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}`);
        } else {
          console.log(`${key}:`, value);
        }
      }
    } else {
      config.headers = { 'Content-Type': 'application/json' };
      endpoint = `${API}/createFlow-json`;
      console.log("Sending JSON data");
    }

    console.log("API endpoint:", endpoint);
    const response = await axios.post(endpoint, requestData, config);
    console.log("Response received:", response);
    return response.data;
  } catch (error) {
    console.error("Request creation failed:", error);
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
