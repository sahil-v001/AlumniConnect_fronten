import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import API from "../../config";
import { UserContext } from "../../context/UserContext";

const ApiInput = ({
  label,
  placeholder,
  apiType,
  value,
  onChange,
  helpText,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }

      if (!isOpen) return;

      setIsLoading(true);
      try {
        let results = [];
        if (apiType === "location") {
          const res = await API.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=5&language=en&format=json`,
          );
          if (res.data.results) {
            results = res.data.results.map((p) => `${p.name}, ${p.country}`);
          }
        } else if (apiType === "job") {
          const res = await API.get(
            `https://api.datamuse.com/words?ml=${value}&max=5`,
          );
          results = res.data.map(
            (i) => i.word.charAt(0).toUpperCase() + i.word.slice(1),
          );
        }
        setSuggestions(results);
      } catch (e) {
        console.error("Autocomplete fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timer);
  }, [value, apiType, isOpen]);

  return (
    <div className="relative mb-6" ref={wrapperRef}>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
        {label} <span className="text-red-500 dark:text-red-400">*</span>
      </label>
      <input
        type="text"
        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => value.length > 1 && setIsOpen(true)}
      />
      {helpText && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">{helpText}</p>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl mt-1 overflow-hidden transition-colors">
          {isLoading ? (
            <div className="p-3 text-xs text-slate-400 dark:text-slate-500 text-center">
              Fetching...
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm cursor-pointer text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors"
                onClick={() => {
                  onChange(item);
                  setIsOpen(false);
                }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PostJob = ({ onBack }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    applyLink: "",
    referralAvailable: false,
  });

  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired or missing. Please log in again.");
        setIsSubmitting(false);
        navigate("/login");
        return; 
      }

      const payload = {
        ...formData,
        tags,
      };

      await API.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs`,
        payload,
        {
          headers: {
            "x-auth-token": token,
          },
        },
      );

      setSuccess(true);
      toast.success("Job posted successfully!");
    } catch (error) {
      console.error("🚨 FULL AXIOS ERROR:", error);
      
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (error.response) {
        const errorMessage = error.response.data?.error || "Server returned an error";
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error("Network Error: Could not connect to the server.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 max-w-lg w-full p-10 rounded-3xl shadow-xl dark:shadow-slate-900/50 text-center border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg
              className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Job Posted!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your opportunity has been shared with the alumni network. Good luck!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Return to Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-8 md:py-12 px-4 md:px-6 transition-colors duration-300 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Post a Job
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Share an opportunity with your network.
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors w-full sm:w-auto text-left sm:text-right"
          >
            &larr; Cancel
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-700 pb-2 transition-colors">
              Role Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApiInput
                label="Job Role"
                placeholder="e.g. Product Designer"
                apiType="job"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                helpText="We'll use this to help candidates find your job."
              />

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                  Company Name <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="e.g. Microsoft"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApiInput
                label="Location"
                placeholder="e.g. Bangalore"
                apiType="location"
                value={formData.location}
                onChange={(val) => setFormData({ ...formData, location: val })}
              />

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                  Job Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors shadow-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Remote</option>
                </select>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6 mt-4 border-b border-slate-100 dark:border-slate-700 pb-2 transition-colors">
              Requirements
            </h3>

            {/* Custom Tag Builder */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Skills / Tags
              </label>
              <div className="border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all flex flex-wrap gap-2 min-h-[56px] shadow-sm">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-600"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="flex-1 min-w-[140px] outline-none text-sm px-2 py-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Type skill & hit Enter"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Job Description <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <textarea
                required
                rows="5"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors shadow-sm placeholder-slate-400 dark:placeholder-slate-500 resize-y"
                placeholder="Briefly describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6 mt-4 border-b border-slate-100 dark:border-slate-700 pb-2 transition-colors">
              Application
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Application Link / Email <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="https://company.com/careers/job-id or email@company.com"
                value={formData.applyLink}
                onChange={(e) =>
                  setFormData({ ...formData, applyLink: e.target.value })
                }
              />
            </div>

            {/* Referral Toggle Panel */}
            <div className="bg-blue-50/80 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between mb-8 transition-colors">
              <div className="pr-4">
                <h4 className="font-bold text-blue-900 dark:text-blue-400 text-sm md:text-base">
                  Offer Referral?
                </h4>
                <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300/80 mt-1">
                  Check this if you are willing to refer candidates internally.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.referralAvailable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referralAvailable: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-md active:scale-[0.98] ${
                isSubmitting
                  ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg dark:hover:shadow-blue-900/20"
              }`}
            >
              {isSubmitting ? "Publishing..." : "Post Opportunity"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;