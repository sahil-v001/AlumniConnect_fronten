import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Helper function to decode the token and check expiration
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decodedPayload = JSON.parse(decodedJson);
      const expirationTime = decodedPayload.exp * 1000;
      return Date.now() > expirationTime;
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      if (isTokenExpired(storedToken)) {
        console.log("Initial check: Session expired.");
        logoutUser(); 
      } else {
        setUser(JSON.parse(storedUser)); 
      }
    } else if (storedUser || storedToken) {
      logoutUser();
    }
  }, []);

  const loginUser = (backendData, token) => {
    const safeUserData = {
      _id: backendData._id,
      fullName: backendData.fullName,
      email: backendData.email,
      collegeName: backendData.collegeName,
      graduationYear: backendData.graduationYear,
      isVerified: backendData.isVerified,
      profilePic: backendData.profilePic,
      resume: backendData.resume || "",
      backupEmail: backendData.backupEmail || "",
      bio: backendData.bio || "",
      currentCompany: backendData.currentCompany || "",
      jobRole: backendData.jobRole || "",
      yearsExperience: backendData.yearsExperience || 0,
      createdAt: backendData.createdAt,
      connections: backendData.connections || [],
      notifications: backendData.notifications || [], 
      pendingConnections: backendData.pendingConnections || [],
      vouchRequests: backendData.vouchRequests || [], 
    };

    setUser(safeUserData);
    localStorage.setItem("user", JSON.stringify(safeUserData));
    if (token) {
        localStorage.setItem("token", token);
    }
  };

  // --- NEW: REFRESH USER FUNCTION ---
  // Call this after accepting/rejecting connections to pull fresh data
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // NOTE: Ensure you have an endpoint like app.get("/api/auth/me") in your backend
      // that returns the current logged-in user's complete profile.
      const res = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`, {
        headers: { "x-auth-token": token }
      });
      loginUser(res.data, token); // Update context and localStorage
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); 
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};