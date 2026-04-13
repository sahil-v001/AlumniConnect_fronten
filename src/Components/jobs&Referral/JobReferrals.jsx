import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
      <label className="block text-sm font-bold text-slate-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value) setIsOpen(true);
        }}
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer"
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
            <div className="p-3 text-center text-xs text-slate-400">No results.</div>
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
  const [selectedSkills, setSelectedSkills] = useState([]); // <--- NEW STATE FOR SKILLS
  const [referralOnly, setReferralOnly] = useState(false);
  const [textSearch, setTextSearch] = useState("");

  const { user } = useContext(UserContext);
  const currentYear = new Date().getFullYear();
  const isAlumni = user?.graduationYear <= currentYear;

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs`, {
        headers: {
          "x-auth-token": token
        }
      });
      if (Array.isArray(res.data)) setJobList(res.data);
    } catch (error) {
      // --- NEW 401 CATCH BLOCK ---
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Failed to load jobs");
      }
      // ----------------------------
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [showPostJob]);

  const handleDelete = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/api/jobs/${jobId}`, {
        headers: {
          "x-auth-token": token
        }
      });
      setJobList(jobList.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      // --- NEW 401 CATCH BLOCK ---
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.log(error);
        toast.error(error.response?.data?.error || "Failed to delete job");
      }
      // ----------------------------
    }
  };

  // --- UPDATED FILTERING LOGIC ---
  const filteredJobs = jobList.filter((job) => {
    const matchText = job.company.toLowerCase().includes(textSearch.toLowerCase());
    
    const matchRole =
      selectedRoles.length === 0 ||
      selectedRoles.some((r) => job.role.toLowerCase().includes(r.toLowerCase()));
      
    const matchLocation =
      selectedLocations.length === 0 ||
      selectedLocations.some((l) =>
        job.location.toLowerCase().includes(l.split(",")[0].toLowerCase())
      );
      
    // NEW LOGIC: Check if the job has the selected skills
    const matchSkills = 
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => 
        job.tags?.some((tag) => tag.toLowerCase().includes(skill.toLowerCase()))
      );

    const matchReferral = !referralOnly || job.referralAvailable;
    
    let isPosterSenior = true;
    if (user && job.batch) {
       isPosterSenior = job.batch <= user.graduationYear;
    }

    if (isAlumni) {
      // Added matchSkills to the return check
      return matchText && matchRole && matchLocation && matchSkills && matchReferral && isPosterSenior;
    }
    // Added matchSkills to the return check
    return matchText && matchRole && matchLocation && matchSkills && matchReferral;
  });

  if (showPostJob) {
    return <PostJob onBack={() => setShowPostJob(false)} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans relative">
      <div className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Career Opportunities
            </h1>
            <p className="text-slate-600 mt-2">
              {isAlumni
                ? `Welcome, Class of ${user?.graduationYear}. Connect with your network.`
                : "Exclusive job openings from your alumni network."}
            </p>
          </div>

          {isAlumni && (
            <button
              onClick={() => setShowPostJob(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>+</span> Post a Job
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
              <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                Filters
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Company Search
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setTextSearch(e.target.value)}
                />
              </div>

              <ApiAutocomplete
                label="Job Roles (Live API)"
                placeholder="Type role..."
                apiType="job"
                onSelect={(val) =>
                  !selectedRoles.includes(val) && setSelectedRoles([...selectedRoles, val])
                }
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedRoles.map((role) => (
                  <span
                    key={role}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-blue-100"
                  >
                    {role}
                    <button onClick={() => setSelectedRoles(selectedRoles.filter((r) => r !== role))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <ApiAutocomplete
                label="Locations (Live API)"
                placeholder="Type city..."
                apiType="location"
                onSelect={(val) =>
                  !selectedLocations.includes(val) && setSelectedLocations([...selectedLocations, val])
                }
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedLocations.map((loc) => (
                  <span
                    key={loc}
                    className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-emerald-100"
                  >
                    {loc.split(",")[0]}
                    <button onClick={() => setSelectedLocations(selectedLocations.filter((l) => l !== loc))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* --- NEW SKILLS FILTER UI --- */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Skills / Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g. React (Press Enter)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      e.preventDefault();
                      const newSkill = e.target.value.trim();
                      if (!selectedSkills.includes(newSkill)) {
                        setSelectedSkills([...selectedSkills, newSkill]);
                      }
                      e.target.value = ""; // Clear input after adding
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-purple-100"
                  >
                    {skill}
                    <button onClick={() => setSelectedSkills(selectedSkills.filter((s) => s !== skill))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {/* --- END NEW SKILLS FILTER UI --- */}

              <label className="flex items-center justify-between cursor-pointer py-2 border-t border-slate-100 pt-4">
                <span className="font-bold text-slate-700 text-sm">Referral Only</span>
                <input
                  type="checkbox"
                  className="accent-blue-600 w-5 h-5"
                  checked={referralOnly}
                  onChange={() => setReferralOnly(!referralOnly)}
                />
              </label>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="mb-4 text-sm text-slate-500 flex justify-between items-center">
              <span>Showing {filteredJobs.length} jobs</span>
              {isAlumni && (
                <span className="italic text-xs text-slate-400">
                  (Hidden: Junior posts)
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job._id || job.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="flex gap-5 items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0">
                        {job.company[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{job.role}</h3>
                        <p className="text-blue-600 font-medium">
                          {job.company} • <span className="text-slate-500 font-normal">{job.location}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.tags && job.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          Posted by {job.postedBy}
                        </p>
                        <p className="text-xs text-slate-500">Class of {job.batch}</p>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        {user && job.postedBy === user.fullName && (
                          <button 
                            onClick={() => handleDelete(job._id)}
                            className="flex-1 md:flex-none bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/jobs/${job._id}`)} 
                          className="flex-1 md:flex-none bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <h3 className="text-xl font-bold text-slate-400">No jobs found</h3>
                  <p className="text-slate-400">Try adjusting your filters.</p>
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