import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext'; 
import { Link, useNavigate } from 'react-router-dom'; // <-- Added useNavigate
import toast from 'react-hot-toast';

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate(); // <-- Initialize navigate
  const [allUsers, setAllUsers] = useState([]); 
  const [displayList, setDisplayList] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("discover_alumni"); 
  const [loading, setLoading] = useState(true);

  // Keep track of who we already sent vouch requests to during this session
  const [sentRequests, setSentRequests] = useState([]);

  const fetchNetwork = async (query = "") => {
    if (!user) return;
    try {
      setLoading(true);
      const payload = {
        college: user.collegeName || user.college, 
        userGraduationYear: user.graduationYear,
        searchQuery: query
      };
      const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-alumni", payload);
      setAllUsers(res.data);
      setLoading(false);
    } catch (err) {
      // Note: /search-alumni might not be protected by authMiddleware in your backend
      // But if it is, we catch the 401 here just in case.
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.log(err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNetwork(); 
    }
  }, [user]);

  useEffect(() => {
    if (!user || allUsers.length === 0) return;

    let filtered = allUsers.filter(u => u._id !== user._id);

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const userConnections = user.connections || [];

    if (activeTab === "connections") {
      filtered = filtered.filter(u => userConnections.includes(u._id));
    } else if (activeTab === "discover_alumni") {
      filtered = filtered.filter(u => 
        !userConnections.includes(u._id) && parseInt(u.graduationYear) <= parseInt(user.graduationYear)
      );
    } else if (activeTab === "discover_juniors") {
      filtered = filtered.filter(u => 
        !userConnections.includes(u._id) && parseInt(u.graduationYear) > parseInt(user.graduationYear)
      );
    }

    setDisplayList(filtered);
  }, [activeTab, searchTerm, allUsers, user]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    fetchNetwork(e.target.value); 
  };

  // --- UPDATED CONNECTION REQUEST FUNCTION ---
  const handleConnectRequest = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/request/${targetId}`, 
        {}, 
        { headers: { "x-auth-token": token } } 
      );
      
      // Update global user state with the new pending connection
      setUser(prevUser => ({
        ...prevUser,
        pendingConnections: res.data.pendingConnections
      }));

      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      storedUser.pendingConnections = res.data.pendingConnections;
      localStorage.setItem("user", JSON.stringify(storedUser));

      toast.success("Connection request sent!");
    } catch (err) {
      // --- NEW 401 CATCH BLOCK ---
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.log(err);
        toast.error(err.response?.data?.error || "Failed to send request");
      }
      // ----------------------------
    }
  };


  // --- NEW DISCONNECT FUNCTION ---
  const handleDisconnect = async (targetId) => {
    // Optional: Add a confirmation dialog so users don't accidentally click it
    if (!window.confirm("Are you sure you want to remove this connection?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/disconnect/${targetId}`, 
        {}, 
        { headers: { "x-auth-token": token } } 
      );
      
      // 1. Update global user state with the new connections array (minus the removed user)
      setUser(prevUser => ({
        ...prevUser,
        connections: res.data.connections
      }));

      // 2. Update local storage so the state persists on page refresh
      const storedUser = JSON.parse(localStorage.getItem("user"));
      storedUser.connections = res.data.connections;
      localStorage.setItem("user", JSON.stringify(storedUser));

      toast.success("Connection removed.");
    } catch (err) {
      // --- NEW 401 CATCH BLOCK ---
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.log(err);
        toast.error(err.response?.data?.error || "Failed to disconnect");
      }
      // ----------------------------
    }
  };

  // --- NEW VOUCH REQUEST FUNCTION ---
  const handleVouchRequest = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/vouch/request/${targetId}`, 
        {}, 
        { headers: { "x-auth-token": token } } 
      );
      
      setSentRequests([...sentRequests, targetId]);
      toast.success("Vouch request sent successfully!");
    } catch (err) {
      // --- NEW 401 CATCH BLOCK ---
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.log(err);
        toast.error(err.response?.data?.error || "Failed to send request");
      }
      // ----------------------------
    }
  };

  // ==========================================
  // GUEST VIEW: PUBLIC LANDING PAGE
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <div className="bg-slate-900 text-white pt-32 pb-24 px-6 text-center rounded-b-[4rem] shadow-2xl relative">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Welcome to <span className="text-blue-500">AlumniConnect</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Bridging the gap between students and alumni. Build your network, get job referrals, and attend exclusive events hosted by graduates from your college.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-full font-bold hover:bg-blue-700 hover:scale-105 transition-all shadow-lg"
            >
              Join the Network
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-slate-800 border border-slate-700 text-white text-lg rounded-full font-bold hover:bg-slate-700 hover:scale-105 transition-all shadow-lg"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>

        <div className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:-translate-y-2 transition-transform">
            <div className="text-5xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Strong Networking</h3>
            <p className="text-slate-600 leading-relaxed">
              Find and connect with seniors who have walked your path. Whether you need career advice or a mentor, your college community is here to help.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:-translate-y-2 transition-transform">
            <div className="text-5xl mb-6">💼</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Exclusive Job Portal</h3>
            <p className="text-slate-600 leading-relaxed">
              Access job postings and direct referral opportunities posted exclusively by alumni working at top companies around the world.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:-translate-y-2 transition-transform">
            <div className="text-5xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Alumni Events</h3>
            <p className="text-slate-600 leading-relaxed">
              Register for workshops, guest lectures, and networking meetups hosted by experienced alumni to boost your skills.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UNVERIFIED ALUMNI VIEW: REQUEST VOUCHES
  // ==========================================
  if (user && !user.isVerified) {
    // For this view, we just show all loaded users except the current one.
    const unverifiedList = allUsers.filter(u => u._id !== user._id && u.isVerified);

    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-12">
        <div className="bg-yellow-50 text-yellow-800 p-4 text-center border-b border-yellow-200">
          <strong>Action Required:</strong> Your account is pending verification.
        </div>
        
        <div className="max-w-4xl mx-auto pt-12 px-6 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Verify Your Alumni Status</h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            To keep AlumniConnect secure and spam-free, we require new alumni to be vouched for by <strong>2 verified peers</strong>. 
            Search for your batchmates below and ask them to verify you!
          </p>

          <input 
            type="text" 
            placeholder="Search for friends or batchmates..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-lg px-8 py-4 rounded-full border border-slate-300 shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:outline-none text-lg mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {loading ? (
                <p className="text-center col-span-full text-gray-500 font-bold">Loading network...</p>
            ) : (
                unverifiedList.map((person) => (
                  <div key={person._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                        {person.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{person.fullName}</h3>
                        <p className="text-xs text-slate-500">Class of {person.graduationYear}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleVouchRequest(person._id)}
                      disabled={sentRequests.includes(person._id) || user.vouchRequests?.includes(person._id)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                        sentRequests.includes(person._id) || user.vouchRequests?.includes(person._id)
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                      }`}
                    >
                      {sentRequests.includes(person._id) || user.vouchRequests?.includes(person._id) 
                        ? "Requested" 
                        : "Ask to Vouch"}
                    </button>
                  </div>
                ))
            )}
            
            {!loading && unverifiedList.length === 0 && (
               <p className="text-center col-span-full text-slate-500 py-10">No verified users found matching your search.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // NORMAL LOGGED IN VIEW: ALUMNI FEED
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <div className="bg-slate-900 text-white pt-20 pb-32 px-4 text-center rounded-b-[3rem] shadow-2xl relative">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
          Hello, <span className="text-blue-400">{user.fullName || user.name}</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Expand your network and stay connected with your college community.
        </p>
        
        <div className="mt-10 inline-flex flex-wrap justify-center bg-slate-800 p-1.5 rounded-full border border-slate-700 shadow-xl gap-1">
            <button 
                onClick={() => setActiveTab("connections")}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === "connections" ? "bg-emerald-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
            >
                My Connections ({user.connections?.length || 0})
            </button>
            <button 
                onClick={() => setActiveTab("discover_alumni")}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === "discover_alumni" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
            >
                Discover Alumni
            </button>
            <button 
                onClick={() => setActiveTab("discover_juniors")}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === "discover_juniors" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
            >
                Discover Juniors
            </button>
        </div>

        <div className="mt-8 flex justify-center relative z-20">
          <input 
            type="text" 
            placeholder={`Search names...`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-lg px-8 py-4 rounded-full border-none shadow-xl text-white focus:ring-4 focus:ring-blue-500/50 focus:outline-none text-lg placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto -mt-20 relative z-10">
        
        {loading ? (
            <p className="text-center col-span-full text-gray-500 font-bold">Loading your network...</p>
        ) : (
            <>
                {displayList.map((person) => {
                  const isConnected = user.connections?.includes(person._id);
                  const isPending = user.pendingConnections?.includes(person._id); 

                  return (
                    <div key={person._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col group border border-gray-100">
                      
                      <div className={`h-24 relative flex justify-center ${isConnected ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}>
                        <div className="w-20 h-20 bg-white rounded-full absolute -bottom-10 flex items-center justify-center text-3xl font-bold text-slate-800 border-[4px] border-white shadow-md group-hover:scale-110 transition-transform">
                          {person.fullName ? person.fullName.charAt(0).toUpperCase() : "?"}
                        </div>
                      </div>

                      <div className="pt-14 pb-6 px-6 text-center flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{person.fullName}</h3>
                        <p className={`text-xs font-bold uppercase tracking-wide mb-4 ${isConnected ? "text-emerald-600" : "text-blue-600"}`}>
                          {person.branch || "Engineering"}
                        </p>
                        
                        <div className="w-full h-px bg-gray-100 mb-4"></div>
                        
                        <div className="space-y-3 text-sm flex-grow">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Class of</span>
                            <span className="text-slate-800 font-bold">{person.graduationYear}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Current Role</span>
                            <span className="text-slate-800 font-bold truncate max-w-[120px]" title={person.currentCompany}>
                              {person.currentCompany || "Student"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                          <Link 
                            to={`/profile/${person._id}`}
                            state={{ profileData: person }}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            View Profile
                          </Link>
                          
                          {/* UPDATED BUTTON LOGIC */}
                          {/* UPDATED BUTTON LOGIC WITH DISCONNECT */}
                          {isConnected ? (
                            <button 
                              onClick={() => handleDisconnect(person._id)}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 cursor-pointer"
                              title="Click to Disconnect"
                            >
                              <span>✕</span> Disconnect
                            </button>
                          ) : isPending ? (
                            <button 
                              disabled
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 border border-slate-200 cursor-default"
                            >
                              <span>⏳</span> Pending
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleConnectRequest(person._id)}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-blue-600 border border-transparent cursor-pointer hover:shadow-xl active:scale-95"
                            >
                              <span>+</span> Connect
                            </button>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
            </>
        )}

        {!loading && displayList.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 mt-10">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-2xl text-slate-800 font-bold mb-2">No profiles found.</p>
            <p className="text-gray-500">
              {activeTab === "connections" 
                ? "You haven't added any connections yet. Switch tabs to discover alumni!" 
                : "Try adjusting your search or switching tabs."}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;