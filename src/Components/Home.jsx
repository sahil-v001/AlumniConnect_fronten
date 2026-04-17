import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext'; 
import { Link, useNavigate } from 'react-router-dom'; 
import toast from 'react-hot-toast';
import { SocketContext } from '../context/socketcontext';

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate(); 
  const [allUsers, setAllUsers] = useState([]); 
  const [displayList, setDisplayList] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("discover_alumni"); 
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
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

  const { socket } = useContext(SocketContext); 

  useEffect(() => {
    if (!socket) return;
    socket.on("connectionAccepted", (updatedConnections) => {
      setUser((prevUser) => {
        const newUser = { ...prevUser, connections: updatedConnections };
        localStorage.setItem("user", JSON.stringify(newUser));
        return newUser;
      });
      toast.success("A connection request was accepted!");
    });
    return () => { socket.off("connectionAccepted"); };
  }, [socket, setUser]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    fetchNetwork(e.target.value); 
  };

  const handleConnectRequest = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/request/${targetId}`, 
        {}, { headers: { "x-auth-token": token } } 
      );
      setUser(prevUser => ({ ...prevUser, pendingConnections: res.data.pendingConnections }));
      toast.success("Connection request sent!");
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else toast.error(err.response?.data?.error || "Failed to send request");
    }
  };

  const handleDisconnect = async (targetId) => {
    if (!window.confirm("Are you sure you want to remove this connection?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/disconnect/${targetId}`, 
        {}, { headers: { "x-auth-token": token } } 
      );
      setUser(prevUser => ({ ...prevUser, connections: res.data.connections }));
      toast.success("Connection removed.");
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else toast.error(err.response?.data?.error || "Failed to disconnect");
    }
  };

  const handleVouchRequest = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/vouch/request/${targetId}`, 
        {}, { headers: { "x-auth-token": token } } 
      );
      setSentRequests([...sentRequests, targetId]);
      toast.success("Vouch request sent successfully!");
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else toast.error(err.response?.data?.error || "Failed to send request");
    }
  };

  // ==========================================
  // GUEST VIEW: PUBLIC LANDING PAGE
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 font-sans transition-colors duration-300">
        <div className="bg-slate-900 dark:bg-slate-950 text-white pt-24 pb-20 md:pt-32 md:pb-24 px-6 text-center rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl relative transition-colors">
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Welcome to <span className="text-blue-500">AlumniConnect</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Bridging the gap between students and alumni. Build your network, get job referrals, and attend exclusive events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-lg rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              Join the Network
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-800 dark:bg-slate-800 border border-slate-700 text-white text-lg rounded-full font-bold hover:bg-slate-700 transition-all shadow-lg active:scale-95">
              Sign In
            </Link>
          </div>
        </div>

        <div className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: "🤝", title: "Networking", desc: "Find and connect with seniors who have walked your path. Mentorship at your fingertips." },
            { icon: "💼", title: "Job Portal", desc: "Access job postings and referral opportunities exclusively by alumni in top companies." },
            { icon: "📅", title: "Events", desc: "Register for workshops and networking meetups hosted by experienced graduates." }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md hover:-translate-y-2 transition-all">
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // UNVERIFIED ALUMNI VIEW: REQUEST VOUCHES
  // ==========================================
  if (user && !user.isVerified) {
    const unverifiedList = allUsers.filter(u => u._id !== user._id && u.isVerified);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-12 transition-colors">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 text-center border-b border-yellow-200 dark:border-yellow-800/50 font-bold">
          Action Required: Your account is pending verification.
        </div>
        
        <div className="max-w-4xl mx-auto pt-12 px-6 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Verify Your Alumni Status</h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            To keep the community secure, we require new alumni to be vouched for by <strong>2 verified peers</strong>. Search for batchmates below!
          </p>

          <input 
            type="text" 
            placeholder="Search for batchmates..."
            onChange={handleSearchChange}
            className="w-full max-w-lg px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:outline-none text-lg mb-12 transition-all"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {loading ? (
                <p className="text-center col-span-full text-slate-400 animate-pulse font-bold">Loading network...</p>
            ) : (
                unverifiedList.map((person) => (
                  <div key={person._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xl">
                        {person.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{person.fullName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Class of {person.graduationYear}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleVouchRequest(person._id)}
                      disabled={sentRequests.includes(person._id) || user.vouchRequests?.includes(person._id)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        sentRequests.includes(person._id) || user.vouchRequests?.includes(person._id)
                          ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer active:scale-95"
                      }`}
                    >
                      {sentRequests.includes(person._id) || user.vouchRequests?.includes(person._id) ? "Requested" : "Vouch"}
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // NORMAL VIEW: ALUMNI FEED
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-12 transition-colors duration-300">
      <div className="bg-slate-900 dark:bg-slate-950 text-white pt-20 pb-32 px-4 text-center rounded-b-[3rem] shadow-2xl relative transition-colors">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Hello, <span className="text-blue-400 dark:text-blue-500">{user.fullName.split(' ')[0]}</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Expand your network and stay connected with your college community.
        </p>
        
        {/* Tab Switcher */}
        <div className="mt-10 inline-flex flex-wrap justify-center bg-slate-800 dark:bg-slate-900 p-1.5 rounded-2xl md:rounded-full border border-slate-700 shadow-xl gap-1">
            {[
              { id: "connections", label: `My Connections (${user.connections?.length || 0})`, color: "bg-emerald-600" },
              { id: "discover_alumni", label: "Discover Alumni", color: "bg-blue-600" },
              { id: "discover_juniors", label: "Discover Juniors", color: "bg-purple-600" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl md:rounded-full text-xs md:text-sm font-bold transition-all ${
                  activeTab === tab.id ? `${tab.color} text-white shadow-lg scale-105` : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>

        <div className="mt-8 flex justify-center relative z-20 px-4">
          <input 
            type="text" 
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-lg px-6 py-4 rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/50 focus:outline-none text-lg placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 px-6 max-w-7xl mx-auto -mt-20 relative z-10">
        {loading ? (
            <p className="text-center col-span-full text-slate-400 animate-pulse font-bold py-20">Loading your network...</p>
        ) : (
            displayList.map((person) => {
              const isConnected = user.connections?.includes(person._id);
              const isPending = user.pendingConnections?.includes(person._id); 

              return (
                <div key={person._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col group border border-slate-100 dark:border-slate-700">
                  <div className={`h-24 relative flex justify-center ${isConnected ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}>
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full absolute -bottom-10 flex items-center justify-center text-3xl font-bold text-slate-800 dark:text-white border-[4px] border-white dark:border-slate-800 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                      {person.profilePic ? (
                        <img src={person.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        person.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="pt-14 pb-6 px-6 text-center flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">{person.fullName}</h3>
                    <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-4 ${isConnected ? "text-emerald-500" : "text-blue-500"}`}>
                      {person.jobRole || "Engineering"}
                    </p>
                    
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-4 transition-colors"></div>
                    
                    <div className="space-y-3 text-sm flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">Class of</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{person.graduationYear}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">Company</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[120px]">{person.currentCompany || "Student"}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <Link 
                        to={`/profile/${person._id}`}
                        state={{ profileData: person }}
                        className="w-full py-2.5 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center"
                      >
                        View Profile
                      </Link>
                      
                      {isConnected ? (
                        <button onClick={() => handleDisconnect(person._id)} className="w-full py-2.5 rounded-xl font-bold text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all">
                          Disconnect
                        </button>
                      ) : isPending ? (
                        <button disabled className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default transition-all">
                          ⏳ Pending
                        </button>
                      ) : (
                        <button onClick={() => handleConnectRequest(person._id)} className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-md active:scale-95">
                          + Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {!loading && displayList.length === 0 && (
        <div className="max-w-xl mx-auto text-center py-20 px-6 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 mt-10 transition-colors">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-xl text-slate-900 dark:text-white font-bold mb-2">No profiles found.</p>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or switching tabs.</p>
        </div>
      )}
    </div>
  );
};

export default Home;