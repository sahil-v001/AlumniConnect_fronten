import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext"; 
import API from "../../config";

const Profile = () => {
  const { user, setUser } = useContext(UserContext); 
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    backupEmail: "",
    currentCompany: "",
    jobRole: "",
    yearsExperience: "",
    bio: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const [resume, setResume] = useState(null);

  // Helper to handle image paths (Absolute vs Relative)
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_SERVER_DOMAIN}/${path.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`,
          {
            headers: { "x-auth-token": token },
          },
        );

        setFormData({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          backupEmail: res.data.backupEmail || "",
          currentCompany: res.data.currentCompany || "",
          jobRole: res.data.jobRole || "",
          yearsExperience: res.data.yearsExperience || "",
          bio: res.data.bio || "",
        });

        if (res.data.profilePic) {
          setPreviewPic(getFullImageUrl(res.data.profilePic));
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          console.error(err);
          toast.error("Failed to load profile data");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === "profilePic") {
      setProfilePic(file);
      setPreviewPic(URL.createObjectURL(file));
    } else if (e.target.name === "resume") {
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const dataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, formData[key]);
      });

      // Append Files
      if (profilePic) dataToSend.append("profilePic", profilePic);
      if (resume) dataToSend.append("resume", resume);

      const res = await API.put(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/profile/update`,
        dataToSend,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // --- PERMANENT SYNC LOGIC ---
      if (res.data.user) {
        // 1. Update Global State (Immediate visual change in Navbar/Chat)
        setUser(res.data.user);
        
        // 2. Update Local Storage (Keep updated data on page refresh)
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error(err);
        toast.error(err.response?.data?.msg || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-lg dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        
        {/* Header Banner */}
        <div className="bg-blue-600 dark:bg-blue-700 px-6 sm:px-10 py-8 text-white transition-colors duration-300">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Edit Profile</h1>
          <p className="text-blue-100 dark:text-blue-200 mt-2 text-sm sm:text-base">
            Update your personal details and work history.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {/* Profile Picture Section */}
          <div className="md:col-span-1 flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md transition-colors">
                {previewPic ? (
                  <img
                    src={previewPic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl text-slate-400">👤</span>
                )}
              </div>

              <label
                htmlFor="profilePicInput"
                className="absolute inset-0 bg-black/50 dark:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm"
              >
                <span className="text-white font-bold text-sm text-center px-2">
                  Change Photo
                </span>
              </label>
              <input
                type="file"
                id="profilePicInput"
                name="profilePic"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Allowed *.jpeg, *.jpg, *.png <br /> Max size of 5 MB
            </p>
          </div>

          {/* Form Fields Section */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Personal Details Panel */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-3 transition-colors">
                Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Primary Email <span className="text-slate-400 font-normal">(Locked)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-sm cursor-not-allowed transition-colors shadow-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Backup Email <span className="text-slate-400 font-normal">(For Recovery)</span>
                  </label>
                  <input
                    type="email"
                    name="backupEmail"
                    value={formData.backupEmail}
                    onChange={handleChange}
                    placeholder="e.g. personal@gmail.com"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors shadow-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Bio / About Me
                  </label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell your network about yourself..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors shadow-sm resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Professional Experience Panel */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-3 transition-colors">
                Professional Experience
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Current Company
                  </label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    placeholder="e.g. Google"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Job Role
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors shadow-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Years at Company
                  </label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload Panel */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-3 transition-colors">
                Resume / CV
              </h3>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📄</span>
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-blue-600 dark:text-blue-400">Click to upload resume</span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      PDF, DOCX (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {resume && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800/30 text-center">
                    Selected: {resume.name}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg dark:shadow-none hover:shadow-xl transition-all duration-300 active:scale-[0.98] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;