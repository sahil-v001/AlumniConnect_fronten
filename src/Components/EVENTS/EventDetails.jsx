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
        // --- NEW 401 CATCH BLOCK ---
        if (error.response && error.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user"); 
          navigate("/login");
        } else {
          // Fallback for other errors (like 404 or 500)
          toast.error("Failed to load event details");
          navigate("/events");
        }
        // ----------------------------
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) return null;

  const currentUserId = user?._id || user?.id;
  const currentUserName = user?.fullName || user?.name;

  const isHost =
    event.proposedBy === currentUserName || event.user === currentUserId;

  const isRegistered = event.attendees?.some((attendee) => {
    const attendeeId =
      typeof attendee === "object" ? attendee._id || attendee.id : attendee;
    return attendeeId === currentUserId;
  });

  const hasMeetingLink = event.meetingLink && event.meetingLink.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative">
          <span className="bg-blue-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">
            {event.format}
          </span>
          <h1 className="text-4xl font-extrabold mb-2">{event.title}</h1>
          <p className="text-slate-400">
            Hosted by{" "}
            <span className="text-white font-semibold">{event.proposedBy}</span>
          </p>

          {isHost && (
            <button
              onClick={() => navigate(`/events/edit/${event._id}`)}
              className="absolute top-8 right-8 bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition"
            >
              Edit Event
            </button>
          )}
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-2">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                About this Event
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="font-semibold text-slate-800">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Attendees
                </p>
                <p className="font-semibold text-slate-800">
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
                  className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  Join Meeting
                </a>
              )}
            </div>
          </div>

          {isHost && (
            <div className="border-t border-slate-200 pt-8 mt-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Registered Attendees
              </h2>
              {!event.attendees || event.attendees.length === 0 ? (
                <p className="text-slate-500 italic">
                  No one has registered yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold rounded-tl-lg">
                          Name
                        </th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Branch</th>
                        <th className="p-4 font-semibold rounded-tr-lg">
                          Batch
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {event.attendees.map((attendee) => {
                        const id =
                          typeof attendee === "object"
                            ? attendee._id || attendee.id
                            : attendee;
                        const name =
                          typeof attendee === "object"
                            ? attendee.fullName || attendee.name
                            : "Unknown User";
                        const email =
                          typeof attendee === "object" ? attendee.email : "N/A";
                        const branch =
                          typeof attendee === "object"
                            ? attendee.branch
                            : "N/A";
                        const gradYear =
                          typeof attendee === "object"
                            ? attendee.graduationYear
                            : "N/A";

                        return (
                          <tr
                            key={id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="p-4 font-medium">{name}</td>
                            <td className="p-4">{email}</td>
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
