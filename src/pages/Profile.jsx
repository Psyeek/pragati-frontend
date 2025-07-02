import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/authService";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile();
      if (data) setProfile(data);
    };

    fetchProfile();
  }, []);

  if (!profile) return <div className="loading">Loading profile...</div>;

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  // Function to get initials from full name
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="container">
      <div className="profile-initial-circle">
        {getInitials(fullName)}
      </div>
      <h2>{fullName}</h2>
      <div className="details">
        <p><strong>Email:</strong> {profile.emailId}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Designation:</strong> {profile.type}</p>
        <p><strong>Department:</strong> {profile.department}</p>
      </div>
      <button className="btn" onClick={() => navigate("/settings")}>
        Go to Settings
      </button>
    </div>
  );
};

export default Profile;
