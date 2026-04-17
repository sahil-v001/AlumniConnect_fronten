import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { ThemeProvider } from "./context/themecontext";

// --- DUMMY UI FOR UNAUTHENTICATED USERS ---
const GuestFallback = ({ title, description, icon }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white max-w-2xl w-full p-10 md:p-16 rounded-[2rem] shadow-xl text-center border border-slate-100 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-white"></div>
        
        <div className="relative z-10">
          <div className="text-7xl mb-6">{icon}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Unlock <span className="text-blue-600">{title}</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-lg rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
            >
              Join the Network
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 text-lg rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AUTH ROUTE WRAPPER ---
// If logged in, shows the actual component. If not, shows the Dummy UI.
const AuthRoute = ({ user, children, title, description, icon }) => {
  if (!user) {
    return <GuestFallback title={title} description={description} icon={icon} />;
  }
  return children;
};

function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setAuthUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      <ThemeProvider>
      <SocketContextProvider authUser={authUser}>
        <UserProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Router>
            <div className="min-h-screen transition-colors duration-300">
              <Navbar />
              <ScrollToTop />
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} /> {/* Home handles its own guest view */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/updatepwd" element={<Updatepwd />} />

                {/* SEMI-PROTECTED ROUTES (Shows Dummy UI if not logged in) */}
                <Route 
                  path="/jobs/*" 
                  element={
                    <AuthRoute 
                      user={authUser} 
                      title="Career Opportunities" 
                      description="Connect with alumni for exclusive job referrals, mentorship, and opportunities at top companies worldwide."
                      icon="💼"
                    >
                      <Routes>
                        <Route index element={<JobReferrals />} />
                        <Route path=":id" element={<JobDetails />} />
                      </Routes>
                    </AuthRoute>
                  } 
                />

                <Route 
                  path="/events/*" 
                  element={
                    <AuthRoute 
                      user={authUser} 
                      title="Alumni Events" 
                      description="Attend exclusive workshops, guest lectures, and networking meetups hosted by experienced graduates."
                      icon="📅"
                    >
                      <Routes>
                        <Route index element={<Events />} />
                        <Route path="register" element={<RegisterEventPage />} />
                        <Route path="agenda" element={<ViewAgendaPage />} />
                        <Route path="submit-proposal" element={<SubmitEventProposalPage />} />
                        <Route path="guidelines" element={<HostGuidelinesPage />} />
                        <Route path=":id" element={<EventDetails />} />
                        <Route path="edit/:id" element={<SubmitEventProposalPage />} />
                      </Routes>
                    </AuthRoute>
                  } 
                />

                <Route 
                  path="/profile/:id" 
                  element={
                    <AuthRoute 
                      user={authUser} 
                      title="Alumni Profiles" 
                      description="View detailed professional profiles of your seniors and batchmates to build your network."
                      icon="👤"
                    >
                      <UserProfile />
                    </AuthRoute>
                  } 
                />

                <Route 
                  path="/chat" 
                  element={
                    <AuthRoute 
                      user={authUser} 
                      title="Direct Messaging" 
                      description="Chat directly with verified alumni to get resume reviews, interview tips, and career guidance."
                      icon="💬"
                    >
                      <ChatPage />
                    </AuthRoute>
                  } 
                />

                {/* STRICTLY PROTECTED ROUTES (For personal user data) */}
                <Route 
                  path="/dashboard" 
                  element={
                    <AuthRoute user={authUser} title="Your Dashboard" description="Log in to view your personalized dashboard." icon="📊">
                      <Dashboard />
                    </AuthRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <AuthRoute user={authUser} title="Your Profile" description="Log in to manage your professional profile." icon="⚙️">
                      <Profile />
                    </AuthRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <AuthRoute user={authUser} title="Notifications" description="Log in to view your activity and connection requests." icon="🔔">
                      <Notifications />
                    </AuthRoute>
                  } 
                />
                
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </SocketContextProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;