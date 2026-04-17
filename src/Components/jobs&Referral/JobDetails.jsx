import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../context/UserContext";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs/${id}`, {
          headers: {
            "x-auth-token": token,
          },
        });
        setJob(res.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error("Failed to load job details.");
          navigate("/jobs"); 
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs/${id}`, {
        headers: {
          "x-auth-token": token
        }
      });
      toast.success("Job deleted successfully");
      navigate("/jobs");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to delete job");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading job details...</div>
      </div>
    );
  }

  if (!job) return null;

  // Secure ownership check using creatorId (fallback to name for old legacy data)
  const isOwner = user && (job.creatorId ? job.creatorId === user._id : job.postedBy === user.fullName);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12 px-4 md:px-6 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-2 transition-colors"
          >
            <span>&larr;</span> Back to Jobs
          </button>
          
          {isOwner && (
            <button
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-2.5 rounded-xl text-sm font-bold border border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
            >
              Delete Job
            </button>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          
          {/* Header Section */}
          <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-blue-600 dark:text-blue-400 shrink-0 shadow-sm border border-blue-50 dark:border-blue-800/30">
                  {job.company[0]}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{job.role}</h1>
                  <p className="text-base md:text-lg text-blue-600 dark:text-blue-400 font-bold mb-4 flex flex-wrap justify-center sm:justify-start items-center gap-2">
                    {job.company} 
                    <span className="text-slate-300 dark:text-slate-600">•</span> 
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{job.location}</span>
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-600">
                      {job.type}
                    </span>
                    {job.referralAvailable && (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/30">
                        Referral Available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex flex-col w-full md:w-auto shrink-0 mt-2 md:mt-0">
                <a
                  href={
                    job.applyLink.includes("@") && !job.applyLink.startsWith("http")
                      ? `mailto:${job.applyLink}`
                      : job.applyLink.startsWith("http")
                      ? job.applyLink
                      : `https://${job.applyLink}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-center shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-10">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              Job Description
            </h3>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-10 text-base">
              {job.description}
            </div>

            {/* Tags/Skills */}
            {job.tags && job.tags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                  Skills & Requirements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Poster Info Footer */}
            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-colors">
              <div>
                <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Posted By Alumni
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{job.postedBy}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Class of {job.batch}</p>
              </div>
              {job.referralAvailable && (
                <button className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]">
                  Request Referral
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;