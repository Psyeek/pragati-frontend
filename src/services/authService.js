import axios from "axios";

const API = "http://localhost:8808/api"; // Backend base URL

axios.defaults.withCredentials = true;

export const registerUser = async (data) => {
  const response = await axios.post(`${API}/register`, data, {
    withCredentials: true,
  });
  return response.data;
};


export const loginUser = async (credentials) => {
  const response = await axios.post(`${API}/login`, credentials, {
    withCredentials: true,
  });
  return response.data;
};

export const logoutUser = async () => {
  try {
    await axios.post(`${API}/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed:", error?.response?.data || error.message);
  } finally {
    localStorage.removeItem("user");
  }
};


export const getSessionUser = async () => {
  try {
    const response = await axios.get("http://localhost:8808/api/session-user", {
      withCredentials: true,
    });
    return response.data; 
  } catch (error) {
    console.error("Session user fetch failed:", error?.response?.data || error.message);
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API}/user/profile`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error?.response?.data || error.message);
    return null;
  }
};
