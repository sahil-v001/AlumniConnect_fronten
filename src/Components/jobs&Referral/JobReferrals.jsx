import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import PostJob from "./PostJob";
import { UserContext } from "../../context/UserContext";

const ApiAutocomplete = ({ label, placeholder, apiType, onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
    const timeOutId = setTimeout(async () => {
      if (query.length < 2) return;
      setIsLoading(true);
      setIsOpen(true);
      try {
        let results = [];
        if (apiType === "location") {
          const res = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`
          );
          if (res.data.results) {
            results = res.data.results.map((p) => `${p.name}, ${p.country}`);
          }
        } else if (apiType === "job") {
          const res = await axios.get(
            `https://api.datamuse.com/words?ml=${query}&max=5`
          );
          results = res.data.map(
            (i) => i.word.charAt(0).toUpperCase() + i.word.slice(1)
          );
        }
        setSuggestions(results);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [query, apiType]);

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
        {label}
      </label>
      <input
        type="text"
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors shadow-sm"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value) setIsOpen(true);
        }}
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-20 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto transition-colors">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                onClick={() => {
                  onSelect(item);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                {item}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">No results.</div>
          )}
        </div>
      )}
    </div>
  );
};

const JobReferrals = () => {
  const navigate = useNavigate();
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobList, setJobList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [referralOnly, setReferralOnly] = useState(false);
  const [textSearch, setTextSearch] = useState("");

  const { user } = useContext(UserContext);
  const currentYear = new Date().getFullYear();
  const isAlumni = parseInt(user?.graduationYear) <= currentYear;

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs`, {
        headers: { "x-auth-token": token }
      });
      if (Array.isArray(res.data)) setJobList(res.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Failed to load jobs");
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [showPostJob]);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs/${jobId}`, {
        headers: { "x-auth-token": token }
      });
      setJobList(jobList.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.log(error);
        toast.error(error.response?.data?.error || "Failed to delete job");
      }
    }
  };

  const filteredJobs = jobList.filter((job) => {
    const matchText = job.company?.toLowerCase().includes(textSearch.toLowerCase());
    const matchRole = selectedRoles.length === 0 || selectedRoles.some((r) => job.role?.toLowerCase().includes(r.toLowerCase()));
    const matchLocation = selectedLocations.length === 0 || selectedLocations.some((l) => job.location?.toLowerCase().includes(l.split(",")[0].toLowerCase()));
    const matchSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => job.tags?.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())));
    const matchReferral = !referralOnly || job.referralAvailable;

    let isPosterSenior = true;
    if (user && job.batch) {
      isPosterSenior = job.batch <= user.graduationYear;
    }

    if (isAlumni) {
      return matchText && matchRole && matchLocation && matchSkills && matchReferral && isPosterSenior;
    }
    return matchText && matchRole && matchLocation && matchSkills && matchReferral;
  });

  // --- UNVERIFIED ALUMNI GATEWAY ---
  if (user && isAlumni && !user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl dark:shadow-slate-900/50 text-center border border-slate-200 dark:border-slate-700 max-w-lg transition-colors duration-300">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">Verification Pending</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            You must be verified by your peers before accessing the Job Referrals portal. Head over to the Home page to request vouches from your batchmates.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (showPostJob) {
    return <PostJob onBack={() => setShowPostJob(false)} />;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans relative transition-colors duration-300">
      <div className="py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Career Opportunities
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {isAlumni
                ? `Welcome, Class of ${user?.graduationYear}. Connect with your network.`
                : "Exclusive job openings from your alumni network."}
            </p>
          </div>

          {isAlumni && (
            <button
              onClick={() => setShowPostJob(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg dark:shadow-none hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="text-lg">+</span> Post a Job
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-md sticky top-[100px] transition-colors duration-300">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-white mb-5 border-b border-slate-100 dark:border-slate-700 pb-3">
                Filters
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                  Company Search
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors shadow-sm"
                  onChange={(e) => setTextSearch(e.target.value)}
                />
              </div>

              <ApiAutocomplete
                label="Job Roles"
                placeholder="Type role..."
                apiType="job"
                onSelect={(val) => !selectedRoles.includes(val) && setSelectedRoles([...selectedRoles, val])}
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedRoles.map((role) => (
                  <span key={role} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-100 dark:border-blue-800/50 transition-colors">
                    {role}
                    <button onClick={() => setSelectedRoles(selectedRoles.filter((r) => r !== role))} className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>

              <ApiAutocomplete
                label="Locations"
                placeholder="Type city..."
                apiType="location"
                onSelect={(val) => !selectedLocations.includes(val) && setSelectedLocations([...selectedLocations, val])}
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedLocations.map((loc) => (
                  <span key={loc} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800/50 transition-colors">
                    {loc.split(",")[0]}
                    <button onClick={() => setSelectedLocations(selectedLocations.filter((l) => l !== loc))} className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                  Skills / Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g. React (Press Enter)"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      e.preventDefault();
                      const newSkill = e.target.value.trim();
                      if (!selectedSkills.includes(newSkill)) {
                        setSelectedSkills([...selectedSkills, newSkill]);
                      }
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedSkills.map((skill) => (
                  <span key={skill} className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-100 dark:border-purple-800/50 transition-colors">
                    {skill}
                    <button onClick={() => setSelectedSkills(selectedSkills.filter((s) => s !== skill))} className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>

              <label className="flex items-center justify-between cursor-pointer py-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Referral Only</span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 cursor-pointer"
                  checked={referralOnly}
                  onChange={() => setReferralOnly(!referralOnly)}
                />
              </label>
            </div>
          </div>

          {/* Job Listings */}
          <div className="xl:col-span-3">
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400 flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <span className="font-bold">Showing {filteredJobs.length} jobs</span>
              {isAlumni && (
                <span className="italic text-xs">
                  (Hidden: Junior posts)
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  // Secure ownership check using creatorId
                  const isOwner = user && (job.creatorId ? job.creatorId === user._id : job.postedBy === user.fullName);
                  
                  return (
                    <div
                      key={job._id || job.id}
                      className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm dark:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="flex gap-4 md:gap-5 items-center md:items-start">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-extrabold text-blue-600 dark:text-blue-400 shrink-0 shadow-sm border border-blue-100 dark:border-slate-600 transition-colors">
                          {job.company ? job.company[0] : "J"}
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">{job.role}</h3>
                          <p className="text-blue-600 dark:text-blue-400 font-bold mt-1 text-sm md:text-base">
                            {job.company} <span className="text-slate-400 dark:text-slate-500 font-normal mx-1">•</span> <span className="text-slate-600 dark:text-slate-400 font-medium">{job.location}</span>
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.tags && job.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] md:text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                            {job.tags && job.tags.length > 3 && (
                              <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 text-slate-500 dark:text-slate-400">
                                +{job.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Posted by {job.postedBy}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Class of {job.batch}</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="flex-1 md:flex-none bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl text-sm font-bold border border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
                            >
                              Delete
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="flex-1 md:flex-none bg-slate-900 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors duration-300">
                  <div className="text-5xl mb-4">💼</div>
                  <h3 className="text-xl font-extrabold text-slate-500 dark:text-slate-400 mb-2">No jobs found</h3>
                  <p className="text-slate-400 dark:text-slate-500">Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobReferrals;