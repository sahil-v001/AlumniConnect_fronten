import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [myEvents, setMyEvents] = useState({ registered: [], hosted: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          navigate("/login"); 
          return;
        }

        const headers = {
          "x-auth-token": token,
          Authorization: `Bearer ${token}`,
        };

        const profileRes = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/profile/dashboard",
          { headers }
        );
        setData(profileRes.data);

        try {
          const eventsRes = await axios.get(
            import.meta.env.VITE_SERVER_DOMAIN + "/api/events/my-events",
            { headers }
          );
          setMyEvents({
            registered: eventsRes.data.registeredEvents || [],
            hosted: eventsRes.data.hostedEvents || [],
          });
        } catch (eventErr) {
          if (eventErr.response && eventErr.response.status === 401) {
            throw eventErr; 
          }
          console.error(eventErr);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.msg ||
              "Failed to load dashboard data. (Authorization Error)"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-4 font-bold text-slate-600 dark:text-slate-300 text-lg tracking-wide">
          Loading Workspace...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 p-10 text-center transition-colors duration-300">
        <div className="text-red-500 dark:text-red-400 font-bold mb-4 text-xl">⚠️ {error}</div>
        <button onClick={() => navigate("/login")} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
          Go to Login
        </button>
      </div>
    );
  }

  if (!data || !data.user) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-10 text-center text-slate-600 dark:text-slate-400">No profile data found.</div>;
  }

  const isAlumni =
    data.role === "Alumni" ||
    (data.user.graduationYear &&
      parseInt(data.user.graduationYear) <= new Date().getFullYear());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = myEvents.registered.filter((e) => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = myEvents.registered.filter((e) => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-10 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              {isAlumni ? "Alumni Console" : "Student Portal"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors text-lg">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{data.user.name || data.user.fullName}</span>
            </p>
          </div>
          <div
            className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-colors ${
              isAlumni
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
            }`}
          >
            {isAlumni ? "🎓 ALUMNI" : "📖 STUDENT"}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {isAlumni ? (
            <>
              <StatCard title="Total Juniors" value={data.stats?.totalStudents || data.stats?.studentsEnrolled || 0} icon="👨‍🎓" color="blue" />
              <StatCard title="Events Hosted" value={myEvents.hosted.length} icon="🎤" color="purple" />
              <StatCard title="Upcoming Events" value={upcomingEvents.length} icon="📅" color="teal" />
              <StatCard title="Events Attended" value={pastEvents.length} icon="✅" color="orange" />
            </>
          ) : (
            <>
              <StatCard title="Alumni Network" value={data.stats?.totalAlumni || data.stats?.seniorsFollowed || 0} icon="🤝" color="blue" />
              <StatCard title="Connections" value={data.stats?.connections || data.stats?.unreadMessages || 0} icon="📩" color="indigo" />
              <StatCard title="Upcoming Events" value={upcomingEvents.length} icon="📅" color="teal" />
              <StatCard title="Events Attended" value={pastEvents.length} icon="✅" color="green" />
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Upcoming Events Box */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-extrabold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 transition-colors">
              Upcoming Events (Registered)
            </h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 italic p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center flex flex-col items-center justify-center transition-colors">
                <span className="mb-3">You haven't registered for any upcoming events.</span>
                <button
                  onClick={() => navigate("/events")}
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-xl font-bold mt-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-100 dark:border-blue-800/30 shadow-sm active:scale-95"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {upcomingEvents.map((event) => (
                  <li
                    key={event._id}
                    className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">{event.title}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-bold transition-colors">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg w-max border border-blue-200 dark:border-blue-800/30 transition-colors">
                      {event.format || "Upcoming"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Past Events Box */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-extrabold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 transition-colors">
              Event History
            </h2>
            {pastEvents.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 italic p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center transition-colors">
                No past event history found.
              </div>
            ) : (
              <ul className="space-y-4">
                {pastEvents.map((event) => (
                  <li
                    key={event._id}
                    className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">{event.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/30 transition-colors">
                      Attended
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Alumni Only: Hosted Events Box */}
          {isAlumni && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 lg:col-span-2 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors">
                  Events You Are Hosting
                </h2>
                <button
                  onClick={() => navigate("/events/submit-proposal")}
                  className="w-full sm:w-auto text-sm bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  + Propose New Event
                </button>
              </div>

              {myEvents.hosted.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 italic p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-900/30 transition-colors">
                  You haven't proposed any events yet. Share your expertise with
                  the community!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myEvents.hosted.map((event) => {
                    const eventDate = new Date(event.date);
                    eventDate.setHours(0, 0, 0, 0);
                    const isCompleted = eventDate < today;

                    return (
                      <div
                        key={event._id}
                        className="p-6 bg-blue-50/50 dark:bg-slate-900/40 rounded-2xl border border-blue-100 dark:border-slate-700 hover:shadow-md transition flex flex-col group cursor-pointer"
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        <p className="font-extrabold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {event.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-bold transition-colors">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        
                        <div className="mt-auto space-y-3 pt-4 border-t border-blue-100 dark:border-slate-700 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">Status</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                              isCompleted 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600' 
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                            }`}>
                              {isCompleted ? "Completed" : (event.status || "Upcoming")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">Attendees</span>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm transition-colors">
                              {event.attendees?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  // Advanced mapping for Dark Mode compatibility
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30",
    green: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/30",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/30",
    red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/30",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/30",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm border ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-4xl font-extrabold text-slate-900 dark:text-white transition-colors">{value}</div>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-bold uppercase tracking-wider transition-colors">
          {title}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;