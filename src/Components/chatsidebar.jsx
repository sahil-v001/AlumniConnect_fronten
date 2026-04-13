import { useEffect, useState } from "react";
import { useSocketContext } from "../context/socketcontext"; 
import { useNavigate } from "react-router-dom"; // <-- Added import
import toast from "react-hot-toast"; // <-- Added import

const ChatSidebar = ({ selectedUser, setSelectedUser }) => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onlineUsers } = useSocketContext(); 
  const navigate = useNavigate(); // <-- Initialize navigate

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(import.meta.env.VITE_SERVER_DOMAIN+"/api/connect/my-connections", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          }
        });
        
        // --- NEW 401 CHECK (Native Fetch) ---
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return; 
        }
        // ------------------------------------

        const data = await response.json();
        
        if (response.ok) {
          setConnections(data);
        } else {
          console.error("Failed to fetch connections:", data.error);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [navigate]); // Added navigate to dependency array

  return (
    <div className="w-1/3 md:w-1/4 border-r h-full flex flex-col bg-white">
      <div className="p-4 border-b font-bold text-lg text-gray-800">
        My Connections
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-gray-500 text-center animate-pulse">Loading...</div>
        ) : connections.length === 0 ? (
          <div className="p-4 text-gray-500 text-center text-sm">
            No connections yet. Connect with alumni to start chatting!
          </div>
        ) : (
          connections.map((user) => {
            const isOnline = onlineUsers?.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 border-b cursor-pointer flex items-center gap-3 transition-colors duration-200 ${
                  isSelected ? "bg-blue-100 border-l-4 border-blue-600" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} className="w-12 h-12 rounded-full object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-xl text-white font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                <div className="overflow-hidden">
                  <div className="font-semibold text-gray-800 truncate">{user.fullName}</div>
                  <div className="text-xs text-gray-500 truncate">{user.jobRole || user.collegeName}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;