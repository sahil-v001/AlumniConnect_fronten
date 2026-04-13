import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // <-- Added to show redirect message

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
          navigate("/login"); // Force redirect if no token is found on mount
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
          // If specifically the events call fails with 401, handle it here
          if (eventErr.response && eventErr.response.status === 401) {
            throw eventErr; // Throw it to the outer catch block to handle redirect
          }
          console.error(eventErr);
        }
      } catch (err) {
        // --- NEW 401 CATCH BLOCK ---
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
        // ----------------------------
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]); // Added navigate to dependencies

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3 font-bold text-slate-600">
          Loading Workspace...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="text-red-500 font-bold mb-4">⚠️ {error}</div>
        <a href="/login" className="text-blue-600 underline">
          Go to Login
        </a>
      </div>
    );
  }

  if (!data || !data.user) {
    return <div className="p-10 text-center">No profile data found.</div>;
  }

  const isAlumni =
    data.role === "Alumni" ||
    (data.user.graduationYear &&
      parseInt(data.user.graduationYear) < new Date().getFullYear());

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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              {isAlumni ? "Alumni Console" : "Student Portal"}
            </h1>
            <p className="text-slate-500">Welcome back, {data.user.name || data.user.fullName}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              isAlumni
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isAlumni ? "🎓 ALUMNI" : "📖 STUDENT"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {isAlumni ? (
            <>
              <StatCard
                title="Total Juniors"
                value={data.stats?.totalStudents || data.stats?.studentsEnrolled || 0}
                icon="👨‍🎓"
                color="blue"
              />
              <StatCard
                title="Events Hosted"
                value={myEvents.hosted.length}
                icon="🎤"
                color="purple"
              />
              <StatCard
                title="Upcoming Events"
                value={upcomingEvents.length}
                icon="📅"
                color="green"
              />
              <StatCard
                title="Events Attended"
                value={pastEvents.length}
                icon="✅"
                color="orange"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Alumni Network"
                value={data.stats?.totalAlumni || data.stats?.seniorsFollowed || 0}
                icon="🤝"
                color="blue"
              />
              <StatCard
                title="Connections"
                value={data.stats?.connections || data.stats?.unreadMessages || 0}
                icon="📩"
                color="indigo"
              />
              <StatCard
                title="Upcoming Events"
                value={upcomingEvents.length}
                icon="📅"
                color="teal"
              />
              <StatCard
                title="Events Attended"
                value={pastEvents.length}
                icon="✅"
                color="green"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">
              Upcoming Events (Registered)
            </h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-slate-500 italic p-4 border-2 border-dashed rounded-lg text-center flex flex-col items-center justify-center">
                <span className="mb-2">You haven't registered for any upcoming events.</span>
                <button
                  onClick={() => navigate("/events")}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold mt-2 hover:bg-blue-100 transition"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {upcomingEvents.map((event) => (
                  <li
                    key={event._id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{event.title}</p>
                      <p className="text-sm text-blue-600 font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-max">
                      {event.format || "Upcoming"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">
              Event History
            </h2>
            {pastEvents.length === 0 ? (
              <div className="text-slate-500 italic p-4 border-2 border-dashed rounded-lg text-center">
                No past event history found.
              </div>
            ) : (
              <ul className="space-y-4">
                {pastEvents.map((event) => (
                  <li
                    key={event._id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{event.title}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                      Attended
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAlumni && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 mt-4 lg:mt-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-800">
                  Events You Are Hosting
                </h2>
                <button
                  onClick={() => navigate("/events/submit-proposal")}
                  className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  + Propose New Event
                </button>
              </div>

              {myEvents.hosted.length === 0 ? (
                <div className="text-slate-500 italic p-6 border-2 border-dashed rounded-lg text-center bg-slate-50">
                  You haven't proposed any events yet. Share your expertise with
                  the community!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.hosted.map((event) => {
                    const eventDate = new Date(event.date);
                    eventDate.setHours(0, 0, 0, 0);
                    const isCompleted = eventDate < today;

                    return (
                      <div
                        key={event._id}
                        className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 hover:shadow-md transition flex flex-col"
                      >
                        <p className="font-bold text-slate-800 text-lg mb-1">{event.title}</p>
                        <p className="text-sm text-slate-600 mb-3 font-medium">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        
                        <div className="mt-auto space-y-2 pt-3 border-t border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Status</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${isCompleted ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700'}`}>
                              {isCompleted ? "Completed" : (event.status || "Upcoming")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Attendees</span>
                            <span className="text-sm font-bold text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm">
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
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div className="text-3xl font-black text-slate-800">{value}</div>
      <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
};

export default Dashboard;