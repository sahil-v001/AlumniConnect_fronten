import React, { useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserContext } from '../context/UserContext'; 
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Loading your alerts...</p>
      </div>
    );
  }

  // --- VOUCH APPROVAL LOGIC ---
  const handleApprove = async (requesterId, notificationId) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/vouch/approve/${requesterId}`, 
        {}, 
        { headers: { "x-auth-token": token } }
      );
      
      toast.success("Successfully vouched for user!");

      // Remove the notification from the UI immediately
      setUser(prevUser => {
        const updatedNotifications = prevUser.notifications.filter(n => n._id !== notificationId);
        const updatedUser = { ...prevUser, notifications: updatedNotifications };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

    } catch (err) {
      // --- NEW 401 CATCH BLOCK ---
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to approve request.");
      }
      // ----------------------------
    }
  };

  const handleAcceptConnection = async (requesterId, notificationId) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/accept/${requesterId}`, 
        {}, 
        { headers: { "x-auth-token": token } }
      );
      
      toast.success("Connection accepted!");

      setUser(prevUser => {
        const updatedNotifications = prevUser.notifications.filter(n => n._id !== notificationId);
        const updatedUser = { 
            ...prevUser, 
            notifications: updatedNotifications,
            connections: res.data.connections 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

    } catch (err) {
      // --- NEW 401 CATCH BLOCK ---
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to accept connection.");
      }
      // ----------------------------
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
            ←
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {user.notifications?.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</h3>
              <p className="text-slate-500">When you get connection requests, event invites, or alumni vouch requests, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {user.notifications?.slice().reverse().map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100 bg-white text-2xl">
                      {notif.type === "VOUCH_REQUEST" ? "🤝" : notif.type === "VOUCH_APPROVED" ? "✅" : "🔔"}
                    </div>
                    
                    <div>
                      <p className="text-slate-800 font-medium leading-relaxed mb-1 text-lg">
                        {notif.message}
                      </p>
                      <p className="text-sm text-slate-400 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {notif.type === "VOUCH_REQUEST" && (
                    <button 
                      onClick={() => handleApprove(notif.fromUser, notif._id)}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 shrink-0"
                    >
                      Approve Alumni
                    </button>
                  )}

                  {notif.type === "CONNECTION_REQUEST" && (
                    <button 
                      onClick={() => handleAcceptConnection(notif.fromUser, notif._id)}
                      className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95 shrink-0"
                    >
                      Accept Connection
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;