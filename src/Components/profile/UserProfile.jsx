import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [profileData, setProfileData] = useState(location.state?.profileData || null);
  const [loading, setLoading] = useState(!location.state?.profileData);

  useEffect(() => {
    if (profileData) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/profile/${id}`, {
          headers: { "x-auth-token": token }
        });
        setProfileData(res.data);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold animate-pulse transition-colors duration-300">
        Loading Profile...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 text-center transition-colors duration-300">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">User not found</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
          &larr; Go Back Home
        </button>
      </div>
    );
  }

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath; 
    return `${import.meta.env.VITE_SERVER_DOMAIN}/${filePath.replace(/\\/g, '/')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 sm:pt-32 px-4 sm:px-6 pb-12 font-sans transition-colors duration-300">
       <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-slate-900/50 p-6 sm:p-10 text-center border border-gray-100 dark:border-slate-700 transition-colors duration-300">
         
         {/* DYNAMIC PROFILE PICTURE */}
         {profileData.profilePic ? (
           <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 transition-colors">
             <img 
               src={getFileUrl(profileData.profilePic)} 
               alt={profileData.fullName} 
               className="w-full h-full object-cover rounded-full"
             />
           </div>
         ) : (
           <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-5xl font-bold mx-auto mb-6 shadow-lg border-4 border-white dark:border-slate-800 ring-4 ring-blue-50 dark:ring-slate-900 transition-colors">
             {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : "?"}
           </div>
         )}
         
         <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors">{profileData.fullName}</h1>
         <p className="text-lg text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-6 transition-colors">
           {profileData.jobRole ? profileData.jobRole : (profileData.branch || "Engineering")}
         </p>
         
         <div className="w-full h-px bg-gray-100 dark:bg-slate-700 mb-8 transition-colors"></div>
         
         {/* STATS GRID */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
           <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
             <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase mb-1">Class of</p>
             <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{profileData.graduationYear}</p>
           </div>
           <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
             <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase mb-1">Current Company</p>
             <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{profileData.currentCompany || "Student"}</p>
           </div>
           {profileData.yearsExperience && (
             <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 sm:col-span-2 transition-colors">
               <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase mb-1">Experience</p>
               <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{profileData.yearsExperience} Years</p>
             </div>
           )}
         </div>

         {/* BIO */}
         {profileData.bio && (
             <div className="text-left bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl mb-8 border border-blue-100 dark:border-blue-800/30 transition-colors">
                 <p className="text-sm text-blue-500 dark:text-blue-400 font-bold uppercase mb-2">About</p>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{profileData.bio}</p>
             </div>
         )}

         {/* DYNAMIC RESUME BUTTON */}
         {profileData.resume && (
             <a 
               href={getFileUrl(profileData.resume)} 
               target="_blank" 
               rel="noopener noreferrer"
               className="block w-full py-4 mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm text-center cursor-pointer active:scale-[0.98]"
             >
               📄 View Resume
             </a>
         )}

         {/* BACK BUTTON */}
         <button 
            onClick={() => navigate(-1)} 
            className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-md active:scale-[0.98] cursor-pointer"
         >
           ← Back
         </button>
       </div>
    </div>
  );
}

export default UserProfile;