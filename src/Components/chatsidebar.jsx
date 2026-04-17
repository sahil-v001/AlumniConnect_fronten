import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ChatSidebar = ({ selectedUser, setSelectedUser }) => {
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/api/connect/my-connections", {
          headers: { "x-auth-token": token }
        });
        setConnections(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error("Failed to load connections");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [navigate]);

  const filteredConnections = connections.filter(conn => 
    conn.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${isExpanded ? 'w-full md:w-80 lg:w-96' : 'w-full md:w-20'}`}>
      
      {/* Header & Toggle */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 transition-colors">
        {isExpanded && <h2 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">Chats</h2>}
        
        {/* Hide the collapse button on mobile, it's unnecessary and breaks UX */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors mx-auto md:mx-0 hidden md:block focus:outline-none"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          )}
        </button>
      </div>

      {/* Search Bar */}
      {isExpanded && (
        <div className="p-3 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 transition-colors">
          <input 
            type="text" 
            placeholder="Search connections..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          />
        </div>
      )}

      {/* Connection List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-slate-800 transition-colors">
        {loading ? (
          <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse">Loading...</div>
        ) : filteredConnections.length === 0 ? (
          <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-sm">{isExpanded ? "No connections found." : "📭"}</div>
        ) : (
          filteredConnections.map((user) => (
            <div 
              key={user._id} 
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/30
                ${selectedUser?._id === user._id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-500' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-l-transparent dark:border-l-transparent'
                }
              `}
            >
              {/* Avatar */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-sm relative mx-auto md:mx-0 overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Full Name & Details */}
              {isExpanded && (
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-slate-900 dark:text-slate-100 font-bold truncate text-base">{user.fullName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.jobRole || user.collegeName}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;