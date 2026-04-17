import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext"; 
import API from "../../config";

const SubmitEventProposalPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(UserContext); 

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    format: "Webinar (Online)",
    description: "",
    meetingLink: "",
    logistics: [],
  });

  // --- SECURITY REDIRECT ---
  useEffect(() => {
    if (user) {
      const currentYear = new Date().getFullYear();
      const isAlumni = user.graduationYear <= currentYear;

      if (!isAlumni) {
        toast.error("Access Denied: Only alumni can propose events.");
        navigate("/events");
      }
    }
  }, [user, navigate]);
  // -----------------------------

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchEvent = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await API.get(
            import.meta.env.VITE_SERVER_DOMAIN + `/api/events/${id}`,
            { headers: { "x-auth-token": token } },
          );
          const event = res.data;
          setFormData({
            title: event.title,
            date: event.date
              ? new Date(event.date).toISOString().split("T")[0]
              : "",
            format: event.format,
            description: event.description,
            meetingLink: event.meetingLink || "",
            logistics: event.logistics || [],
          });
        } catch (error) {
          if (error.response && error.response.status === 401) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          } else {
            toast.error("Failed to load event for editing");
            navigate("/events");
          }
        }
      };
      fetchEvent();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, logistics: [...formData.logistics, value] });
    } else {
      setFormData({
        ...formData,
        logistics: formData.logistics.filter((item) => item !== value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.description) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (isEditing) {
        await API.put(
          import.meta.env.VITE_SERVER_DOMAIN + `/api/events/${id}`,
          formData,
          { headers: { "x-auth-token": token } },
        );
        toast.success("Event updated successfully!");
        navigate(`/events/${id}`);
      } else {
        await API.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/events/proposal",
          formData,
          { headers: { "x-auth-token": token } },
        );
        toast.success("Proposal submitted successfully!");
        navigate("/events");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to submit");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.graduationYear > new Date().getFullYear()) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300"></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? "Edit Event" : "Host an Event"}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isEditing
              ? "Update your event details below."
              : "Share your knowledge or bring the community together."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Intro to AI Ethics"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors shadow-sm"
              />
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Event Format *
              </label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors shadow-sm"
              >
                <option value="Webinar (Online)">Webinar (Online)</option>
                <option value="Workshop (In-person)">Workshop (In-person)</option>
                <option value="Meetup/Networking">Meetup/Networking</option>
                <option value="Reunion">Reunion</option>
              </select>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Event/Meeting Link (Optional)
            </label>
            <input
              type="text"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://zoom.us/j/... or Maps link"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Event Description & Agenda *
            </label>
            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What will happen during the event?"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors shadow-sm resize-y"
            ></textarea>
          </div>

          {/* Logistics Checkboxes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Logistics Required
            </label>
            <div className="flex flex-wrap gap-4 mt-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              {["Projector/AV", "Auditorium", "Zoom License"].map((item) => (
                <label
                  key={item}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.logistics.includes(item)}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitEventProposalPage;