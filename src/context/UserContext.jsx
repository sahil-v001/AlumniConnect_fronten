import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Helper function to decode the token and check expiration
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      // A JWT has 3 parts. The payload is the 2nd part.
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decodedPayload = JSON.parse(decodedJson);
      
      // The 'exp' claim is in seconds. Date.now() is in milliseconds.
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
      // Cleanup if only one piece of data exists
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
      vouchRequests: backendData.vouchRequests || [], // Added for completeness
    };

    setUser(safeUserData);
    localStorage.setItem("user", JSON.stringify(safeUserData));
    if (token) {
        localStorage.setItem("token", token);
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); 
    // This ensures that any component calling logoutUser() 
    // resets the entire app state and storage.
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};