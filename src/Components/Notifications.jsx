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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Loading alerts...</p>
        </div>
      </div>
    );
  }

  // --- VOUCH LOGIC ---
  const handleApprove = async (requesterId, notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/vouch/approve/${requesterId}`, 
        {}, { headers: { "x-auth-token": token } }
      );
      toast.success("Successfully vouched for user!");
      removeNotificationFromState(notificationId);
    } catch (err) { handleError(err); }
  };

  const handleRejectVouch = async (requesterId, notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/vouch/reject/${requesterId}`, 
        {}, { headers: { "x-auth-token": token } }
      );
      toast.success("Vouch request dismissed.");
      removeNotificationFromState(notificationId);
    } catch (err) { handleError(err); }
  };

  // --- CONNECTION LOGIC ---
  const handleAcceptConnection = async (requesterId, notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/accept/${requesterId}`, 
        {}, { headers: { "x-auth-token": token } }
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
    } catch (err) { handleError(err); }
  };

  const handleRejectConnection = async (requesterId, notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/connect/reject/${requesterId}`, 
        {}, { headers: { "x-auth-token": token } }
      );
      toast.success("Connection request declined.");
      removeNotificationFromState(notificationId);
    } catch (err) { handleError(err); }
  };

  // --- GENERAL NOTIFICATION DISMISSAL ---
  const handleDismissAlert = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/notifications/${notificationId}`, 
        { headers: { "x-auth-token": token } }
      );
      removeNotificationFromState(notificationId);
    } catch (err) { handleError(err); }
  };

  // --- HELPER FUNCTIONS ---
  const removeNotificationFromState = (notificationId) => {
    setUser(prevUser => {
      const updatedNotifications = prevUser.notifications.filter(n => n._id !== notificationId);
      const updatedUser = { ...prevUser, notifications: updatedNotifications };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const handleError = (err) => {
    if (err.response && err.response.status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } else {
      toast.error(err.response?.data?.error || "Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 transition-colors duration-300 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-90"
          >
            ←
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {user.notifications?.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-7xl mb-6 opacity-40">📭</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">You're all caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400">Check back later for new updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {user.notifications?.slice().reverse().map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${!notif.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-800'}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 text-2xl transition-colors">
                      {notif.type === "VOUCH_REQUEST" ? "🤝" : notif.type === "VOUCH_APPROVED" ? "✅" : notif.type === "CONNECTION_REQUEST" ? "🔗" : "🔔"}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed mb-1.5 text-base md:text-lg transition-colors">
                        {notif.message}
                      </p>
                      <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider transition-colors">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { 
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    {notif.type === "VOUCH_REQUEST" && (
                      <>
                        <button 
                          onClick={() => handleRejectVouch(notif.fromUser, notif._id)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleApprove(notif.fromUser, notif._id)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md active:scale-95"
                        >
                          Approve
                        </button>
                      </>
                    )}

                    {notif.type === "CONNECTION_REQUEST" && (
                      <>
                        <button 
                          onClick={() => handleRejectConnection(notif.fromUser, notif._id)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleAcceptConnection(notif.fromUser, notif._id)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 dark:bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-all shadow-md active:scale-95"
                        >
                          Accept
                        </button>
                      </>
                    )}

                    {(notif.type === "VOUCH_APPROVED" || notif.type === "CONNECTION_ACCEPTED" || notif.type === "GENERAL") && (
                      <button 
                        onClick={() => handleDismissAlert(notif._id)}
                        className="w-full md:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
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