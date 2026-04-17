import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API from "../../config";

const Events = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/me",
          { headers: { "x-auth-token": token } }
        );
        setUser(res.data);
        await fetchEvents(token);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchEvents = async (token) => {
    try {
      const res = await API.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/api/events",
        { headers: { "x-auth-token": token } }
      );
      setEvents(res.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Failed to load events");
      }
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/events/${eventId}/register`,
        {}, { headers: { "x-auth-token": token } }
      );
      toast.success("Successfully registered for the event!");
      fetchEvents(token);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to register");
      }
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/events/${eventId}/unregister`,
        {}, { headers: { "x-auth-token": token } }
      );
      toast.success("Successfully unregistered from the event!");
      fetchEvents(token);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to unregister");
      }
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/events/${eventId}`,
        { headers: { "x-auth-token": token } }
      );
      toast.success("Event cancelled successfully!");
      fetchEvents(token);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to cancel event");
      }
    }
  };

  const isAlumni = user ? user.graduationYear <= new Date().getFullYear() : false;

  const featuredEvents = [
    {
      id: 1,
      tag: "Coming Soon",
      title: "The Grand Alumni Homecoming 2026",
      description: "A night of nostalgia, networking, and celebration. Join over 500+ alumni from across the globe returning to campus. Includes a gala dinner, keynote speeches, and department visits.",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Oct 15, 2026",
    },
    {
      id: 2,
      tag: "Live Webinar",
      title: "Future of AI: Alumni Tech Summit",
      description: "Join industry leaders from Google, Microsoft, and OpenAI as they discuss the impact of Artificial Intelligence on the global workforce.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Nov 02, 2026",
    },
    {
      id: 3,
      tag: "Fundraiser",
      title: "Scholarship Gala Night",
      description: "Help the next generation of students. An elegant evening of fine dining and auctions to raise funds for underprivileged students.",
      image: "https://images.unsplash.com/photo-1519671482538-581aca121e96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Dec 10, 2026",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextEvent = () => setCurrentIndex((prev) => prev === featuredEvents.length - 1 ? 0 : prev + 1);
  const prevEvent = () => setCurrentIndex((prev) => prev === 0 ? featuredEvents.length - 1 : prev - 1);
  const currentEvent = featuredEvents[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
          Loading Events...
        </div>
      </div>
    );
  }

  // ==========================================
  // GUEST VIEW: PUBLIC EVENTS OVERVIEW
  // ==========================================
  if (!user) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-300">
        <section className="relative bg-white dark:bg-slate-900 pt-24 pb-16 px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1 rounded-full text-sm font-semibold mb-6 shadow-sm">
              Exclusive Access
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Alumni <span className="text-blue-600 dark:text-blue-500">Events</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed mx-auto">
              Get an inside look at the webinars, workshops, and reunions happening in our community. Join the network to secure your spot!
            </p>
          </div>
        </section>

        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Featured Events</h2>
            <div className="flex gap-2">
              <button onClick={prevEvent} className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 transition">
                ←
              </button>
              <button onClick={nextEvent} className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 transition">
                →
              </button>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-112.5">
            <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full">
              <img key={currentEvent.id} src={currentEvent.image} alt={currentEvent.title} className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-500 animate-fade-in" />
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                {currentEvent.tag}
              </div>
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-blue-400 font-bold tracking-widest uppercase text-sm">Featured</h3>
                <span className="text-slate-300 text-sm border border-slate-500 px-3 py-1 rounded-lg bg-slate-800/50 backdrop-blur-sm">
                  {currentEvent.date}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentEvent.title}</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">{currentEvent.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition text-center shadow-lg hover:shadow-xl">
                  Sign up to Register
                </Link>
                <Link to="/login" className="bg-transparent border border-slate-500 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold transition text-center">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {featuredEvents.map((_, index) => (
              <div key={index} className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-blue-600 dark:bg-blue-500" : "w-2 bg-slate-300 dark:bg-slate-700"}`} />
            ))}
          </div>
        </section>

        <section className="py-20 bg-blue-600 dark:bg-blue-800 relative overflow-hidden mt-12 transition-colors duration-300">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-6">Unlock Full Community Access</h2>
            <p className="text-xl text-blue-100 mb-10">
              Verified alumni and students get access to our full calendar of private meetups, guest lectures, and networking sessions.
            </p>
            <Link to="/signup" className="inline-block bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-transparent dark:border-slate-700 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-slate-800 transition shadow-xl">
              Join the Network Today
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // LOGGED IN VIEW
  // ==========================================
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-300">
      
      {/* Floating Status Badge */}
      <div className="fixed top-24 right-4 z-40 bg-black/90 dark:bg-slate-800 backdrop-blur-md text-white p-3 rounded-xl text-xs shadow-xl border border-slate-700 dark:border-slate-600 transition-all">
        <p className="mb-0">
          Welcome, {user.fullName.split(" ")[0]} <br />
          Status: <span className="font-bold text-yellow-400 uppercase">{isAlumni ? "Alumni" : "Student"}</span>
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white dark:bg-slate-900 pt-24 pb-16 px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1 rounded-full text-sm font-semibold mb-6 shadow-sm">
            Connecting Generations
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Alumni <span className="text-blue-600 dark:text-blue-500">Events</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed mx-auto">
            Stay updated with upcoming reunions, networking sessions, webinars, and campus events. Whether you are here to learn or to lead, there is a place for you.
          </p>
        </div>
      </section>

      {/* Featured Carousel */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Featured Events</h2>
          <div className="flex gap-2">
            <button onClick={prevEvent} className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 transition">
              ←
            </button>
            <button onClick={nextEvent} className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 transition">
              →
            </button>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-112.5">
          <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full">
            <img key={currentEvent.id} src={currentEvent.image} alt={currentEvent.title} className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-500 animate-fade-in" />
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
              {currentEvent.tag}
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-400 font-bold tracking-widest uppercase text-sm">Featured</h3>
              <span className="text-slate-300 text-sm border border-slate-500 px-3 py-1 rounded-lg bg-slate-800/50 backdrop-blur-sm">
                {currentEvent.date}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentEvent.title}</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">{currentEvent.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button onClick={() => navigate("/events/register")} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg">
                Register Now
              </button>
              <button onClick={() => navigate("/events/agenda")} className="border border-slate-500 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition">
                View Agenda
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {featuredEvents.map((_, index) => (
            <div key={index} className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-blue-600 dark:bg-blue-500" : "w-2 bg-slate-300 dark:bg-slate-700"}`} />
          ))}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="px-6 max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-0">
            <button className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm">
              All Events
            </button>
            <button className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition">
              Webinars
            </button>
            <button className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition">
              Meetups
            </button>
          </div>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Event Grid */}
      <section className="pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-5xl mb-4">🗓️</div>
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400">No upcoming community events found.</p>
              <p className="text-slate-400 dark:text-slate-500">Propose one below!</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const isHost = event.hostId ? event.hostId === user._id : event.proposedBy === user.fullName;
              const isRegistered = event.attendees?.includes(user._id);

              return (
                <div key={event._id} className="bg-white dark:bg-slate-800 group rounded-3xl shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col">
                  
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/events/${event._id}`)}>
                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80" alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                      {new Date(event.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">{event.format}</span>
                    <h3 onClick={() => navigate(`/events/${event._id}`)} className="font-extrabold text-slate-900 dark:text-white mt-2 mb-2 text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition cursor-pointer">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mb-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">👤 {event.proposedBy}</span>
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                          👥 {event.attendees?.length || 0} Registered
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(isRegistered || isHost) && event.meetingLink && event.meetingLink.trim() !== "" && (
                          <a href={event.meetingLink.startsWith("http") ? event.meetingLink : `https://${event.meetingLink}`} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-sm">
                            Join Meeting
                          </a>
                        )}

                        <div className="flex gap-2">
                          {isHost ? (
                            <button onClick={() => handleCancelEvent(event._id)} className="w-full bg-red-600 dark:bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition shadow-sm">
                              Cancel Event
                            </button>
                          ) : isRegistered ? (
                            <button onClick={() => handleUnregister(event._id)} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition border border-red-200 dark:border-red-800/50">
                              Unregister
                            </button>
                          ) : (
                            <button onClick={() => handleRegister(event._id)} className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-2.5 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 transition shadow-sm">
                              Register Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Memories Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Memories from Past Events</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">See what happens when our community comes together.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=800&q=80" alt="Memory" className="w-full h-full object-cover hover:scale-110 transition duration-500" /></div>
            <div className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80" alt="Memory" className="w-full h-full object-cover hover:scale-110 transition duration-500" /></div>
            <div className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80" alt="Memory" className="w-full h-full object-cover hover:scale-110 transition duration-500" /></div>
            <div className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" alt="Memory" className="w-full h-full object-cover hover:scale-110 transition duration-500" /></div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      {isAlumni ? (
        <section className="py-24 bg-blue-600 dark:bg-blue-800 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-6">Have an Idea for an Event?</h2>
            <p className="text-xl text-blue-100 mb-10">As a distinguished alumnus, you have the power to bring the community together. Host a workshop, organize a reunion, or give a guest lecture.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate("/events/submit-proposal")} className="bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-transparent dark:border-slate-700 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-slate-800 transition shadow-xl">
                Submit Event Proposal
              </button>
              <button onClick={() => navigate("/events/guidelines")} className="bg-transparent border border-blue-300 dark:border-blue-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-900/50 transition">
                Read Host Guidelines
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-blue-600 dark:bg-blue-800 text-center transition-colors duration-300">
          <h2 className="text-2xl font-extrabold text-white mb-4">Don't see what you're looking for?</h2>
          <p className="text-blue-100 mb-6">Request a topic for the next webinar.</p>
          <button className="bg-transparent border border-blue-300 dark:border-blue-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-900/50 transition">
            Request Topic &rarr;
          </button>
        </section>
      )}
    </div>
  );
};

export default Events;