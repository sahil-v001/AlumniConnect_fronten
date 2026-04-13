import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react"; // ADDED IMPORT
import Navbar from "./Components/Nav";
import Home from "./Components/Home";
import "./App.css";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Events from "./Components/EVENTS/Events";
import RegisterEventPage from "./Components/EVENTS/RegisterEventPage";
import ViewAgendaPage from "./Components/EVENTS/ViewAgendaPage";
import SubmitEventProposalPage from "./Components/EVENTS/SubmitEventProposalPage";
import HostGuidelinesPage from "./Components/EVENTS/HostGuidelinesPage";
import ScrollToTop from "./Components/ScrollToTop";
import JobReferrals from "./Components/jobs&Referral/JobReferrals";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./context/UserContext";
import Profile from "./Components/profile/profile";
import Updatepwd from "./Components/forgotpassword";
import JobDetails from "./Components/jobs&Referral/JobDetails";
import Dashboard from "./Components/Dashboard";
import EventDetails from "./Components/EVENTS/EventDetails";
import UserProfile from "./Components/profile/UserProfile";
import Notifications from "./Components/Notifications";
import { SocketContextProvider } from "./context/socketcontext";
import ChatPage from "./Components/chatpage";

function App() {
  // 1. CREATE STATE TO HOLD THE USER
  const [authUser, setAuthUser] = useState(null);

  // 2. FETCH THE USER ON MOUNT
  // Since UserContext sits inside App, we can't easily use its hook here.
  // The safest way at the root level is to read the user straight from localStorage.
  useEffect(() => {
    // Assuming your login saves the user object to localStorage as 'user'
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setAuthUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      <UserProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Router>
          <div className="min-h-screen bg-slate-50">
            <Navbar />

            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/updatepwd" element={<Updatepwd />} />
              <Route path="/events">
                <Route index element={<Events />} />
                <Route path="register" element={<RegisterEventPage />} />
                <Route path="agenda" element={<ViewAgendaPage />} />
                <Route
                  path="submit-proposal"
                  element={<SubmitEventProposalPage />}
                />
                <Route path="guidelines" element={<HostGuidelinesPage />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route
                  path="/events/edit/:id"
                  element={<SubmitEventProposalPage />}
                />
              </Route>
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/jobs" element={<JobReferrals />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
      {/* 3. PASS THE ACTUAL STATE VARIABLE */}
      <SocketContextProvider authUser={authUser}>
        <UserProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Router>
            <div className="min-h-screen bg-slate-50">
              <Navbar />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/updatepwd" element={<Updatepwd />} />
                <Route path="/events">
                  <Route index element={<Events />} />
                  <Route path="register" element={<RegisterEventPage />} />
                  <Route path="agenda" element={<ViewAgendaPage />} />
                  <Route
                    path="submit-proposal"
                    element={<SubmitEventProposalPage />}
                  />
                  <Route path="guidelines" element={<HostGuidelinesPage />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route
                    path="/events/edit/:id"
                    element={<SubmitEventProposalPage />}
                  />
                </Route>
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/jobs" element={<JobReferrals />} />
                <Route path="/jobs/:id" element={<JobDetails />} />

                {/* 4. ADD YOUR CHAT ROUTE HERE */}
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </SocketContextProvider>
    </div>
  );
}

export default App;
