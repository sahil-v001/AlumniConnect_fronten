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
        // --- NEW 401 CATCH BLOCK ---
        if (error.response && error.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error("Failed to load job details.");
          navigate("/jobs"); 
        }
        // ----------------------------
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  const handleDelete = async () => {
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
      // --- NEW 401 CATCH BLOCK ---
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to delete job");
      }
      // ----------------------------
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-medium animate-pulse">Loading job details...</div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 md:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
          >
            <span>&larr;</span> Back to Jobs
          </button>
          {user && job.postedBy === user.fullName && (
            <button
              onClick={handleDelete}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
            >
              Delete Job
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex gap-6 items-center md:items-start">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-blue-600 shrink-0 shadow-sm">
                  {job.company[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{job.role}</h1>
                  <p className="text-lg text-blue-600 font-medium mb-4">
                    {job.company} <span className="text-slate-400 mx-2">•</span> 
                    <span className="text-slate-600 font-normal">{job.location}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {job.type}
                    </span>
                    {job.referralAvailable && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Referral Available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
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
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Job Description
            </h3>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-10">
              {job.description}
            </div>

            {job.tags && job.tags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  Skills & Requirements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                  Posted By Alumni
                </p>
                <p className="text-lg font-bold text-slate-900">{job.postedBy}</p>
                <p className="text-sm text-slate-500">Class of {job.batch}</p>
              </div>
              {job.referralAvailable && (
                <button className="bg-white border border-blue-200 text-blue-700 px-5 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-50 transition-colors">
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