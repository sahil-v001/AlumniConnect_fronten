import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API from "../../config";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userRes = await API.get(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/me",
          { headers: { "x-auth-token": token } },
        );
        setUser(userRes.data);

        const eventRes = await API.get(
          import.meta.env.VITE_SERVER_DOMAIN + `/api/events/${id}`,
          { headers: { "x-auth-token": token } },
        );
        setEvent(eventRes.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user"); 
          navigate("/login");
        } else {
          toast.error("Failed to load event details");
          navigate("/events");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!event) return null;

  const currentUserId = user?._id || user?.id;
  const currentUserName = user?.fullName || user?.name;

  // Note: Using your updated ID-based logic from earlier would be best here if implemented in the backend:
  // const isHost = event.hostId ? event.hostId === currentUserId : event.proposedBy === currentUserName;
  const isHost = event.proposedBy === currentUserName || event.user === currentUserId;

  const isRegistered = event.attendees?.some((attendee) => {
    const attendeeId = typeof attendee === "object" ? attendee._id || attendee.id : attendee;
    return attendeeId === currentUserId;
  });

  const hasMeetingLink = event.meetingLink && event.meetingLink.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Banner Section */}
        <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-10 text-white relative">
          <span className="bg-blue-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">
            {event.format}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{event.title}</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Hosted by{" "}
            <span className="text-white font-semibold">{event.proposedBy}</span>
          </p>

          {isHost && (
            <button
              onClick={() => navigate(`/events/edit/${event._id}`)}
              className="mt-6 sm:mt-0 sm:absolute sm:top-8 sm:right-8 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              Edit Event
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Description (Takes up 2 cols on Desktop, 1 on Mobile) */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                About this Event
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                {event.description}
              </p>
            </div>

            {/* Info Side Panel */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 h-fit">
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Attendees
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">👥</span>
                  {event.attendees?.length || 0} Registered
                </p>
              </div>

              {(isRegistered || isHost) && hasMeetingLink && (
                <a
                  href={
                    event.meetingLink.startsWith("http")
                      ? event.meetingLink
                      : `https://${event.meetingLink}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  Join Meeting
                </a>
              )}
            </div>
          </div>

          {/* Attendees Table */}
          {isHost && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Registered Attendees
              </h2>
              
              {!event.attendees || event.attendees.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 italic">
                    No one has registered yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-bold">Name</th>
                        <th className="p-4 font-bold">Email</th>
                        <th className="p-4 font-bold">Branch</th>
                        <th className="p-4 font-bold">Batch</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-700/50">
                      {event.attendees.map((attendee) => {
                        const id = typeof attendee === "object" ? attendee._id || attendee.id : attendee;
                        const name = typeof attendee === "object" ? attendee.fullName || attendee.name : "Unknown User";
                        const email = typeof attendee === "object" ? attendee.email : "N/A";
                        const branch = typeof attendee === "object" ? attendee.branch : "N/A";
                        const gradYear = typeof attendee === "object" ? attendee.graduationYear : "N/A";

                        return (
                          <tr
                            key={id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="p-4 font-semibold text-slate-900 dark:text-slate-200">{name}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">{email}</td>
                            <td className="p-4">{branch || "N/A"}</td>
                            <td className="p-4">{gradYear || "N/A"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;