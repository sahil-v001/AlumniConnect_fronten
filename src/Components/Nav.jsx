import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import NotificationDropdown from './NotificationDropDown';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/themecontext'; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, logoutUser } = useContext(UserContext); 
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isLoggedIn = !!user; 

  const handleLogout = () => {
    logoutUser(); 
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login"); 
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false);
  };

  // Helper to resolve the correct Image URL for the profile pic
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; 
    return `${import.meta.env.VITE_SERVER_DOMAIN}/${path.replace(/\\/g, "/")}`;
  };

  const navLinkStyles = ({ isActive }) =>
    `no-underline text-base transition-all duration-300 pb-1 block ${
      isActive
        ? "text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400"
        : "text-gray-600 dark:text-slate-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <nav className="bg-white dark:bg-slate-900 h-[80px] w-full flex items-center justify-between px-[5%] shadow-md dark:shadow-slate-950/50 border-b border-transparent dark:border-slate-800 sticky top-0 z-[1000] tracking-wide transition-colors duration-300">
      
      {/* BRAND LOGO */}
      <div className="flex justify-start">
        <Link
          to="/"
          className="text-[24px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-2 cursor-pointer no-underline tracking-tight"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="text-2xl">🎓</span> AlumniConnect
        </Link>
      </div>

      {/* DESKTOP NAV LINKS */}
      <ul className="list-none flex justify-center gap-8 m-0 p-0 max-lg:hidden">
        <li><NavLink to="/" className={navLinkStyles}>Home</NavLink></li>
        <li><NavLink to="/events" className={navLinkStyles}>Events</NavLink></li>
        <li><NavLink to="/jobs" className={navLinkStyles}>Jobs & Referrals</NavLink></li>
      </ul>

      {/* DESKTOP ACTIONS */}
      <div className="flex justify-end gap-[15px] max-lg:hidden items-center relative">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme} 
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none text-xl"
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl font-bold text-sm border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-transparent transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 dark:bg-blue-500 text-white shadow-md transition-all hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95"
            >
              Join Network
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4"> 
            <NotificationDropdown />

            <Link
              to="/chat"
              title="Messages"
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors no-underline"
            >
              <span className="text-xl">💬</span>
            </Link>

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-200 overflow-hidden focus:outline-none transition-all"
              >
                {user.profilePic ? (
                  <img 
                    src={getImageUrl(user.profilePic)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">👤</span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-[55px] w-[220px] bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-2 flex flex-col z-[1100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/dashboard"
                    className="px-5 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 no-underline font-bold transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>📊</span> Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="px-5 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 no-underline font-bold transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>⚙️</span> My Profile
                  </Link>

                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 font-bold"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE HEADER BUTTONS */}
      <div className="flex items-center gap-3 lg:hidden">
        <button 
          onClick={toggleTheme} 
          className="text-xl p-2 focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button 
          onClick={toggleMobileMenu}
          className="p-2 text-slate-800 dark:text-slate-200 focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          )}
        </button>
      </div>

      {/* MOBILE FULL-SCREEN DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-6 gap-6 lg:hidden z-[1000] animate-in slide-in-from-top duration-300">
          
          <ul className="flex flex-col gap-5 list-none p-0 m-0">
            <li><NavLink to="/" onClick={toggleMobileMenu} className={navLinkStyles}>Home</NavLink></li>
            <li><NavLink to="/events" onClick={toggleMobileMenu} className={navLinkStyles}>Events</NavLink></li>
            <li><NavLink to="/jobs" onClick={toggleMobileMenu} className={navLinkStyles}>Jobs & Referrals</NavLink></li>
          </ul>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

          {!isLoggedIn ? (
            <div className="flex flex-col gap-4">
              <Link
                to="/login"
                onClick={toggleMobileMenu}
                className="text-center py-3 rounded-xl font-bold border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={toggleMobileMenu}
                className="text-center py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg"
              >
                Join Network
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 px-2 py-1">
                 <div className="w-12 h-12 rounded-full border-2 border-blue-600 overflow-hidden bg-slate-100 flex items-center justify-center">
                    {user.profilePic ? (
                      <img src={getImageUrl(user.profilePic)} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{user.fullName}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                 </div>
              </div>

              <Link to="/chat" onClick={toggleMobileMenu} className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold text-lg no-underline">
                <span className="text-2xl">💬</span> Messages
              </Link>
              <Link to="/notifications" onClick={toggleMobileMenu} className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold text-lg no-underline">
                <span className="text-2xl">🔔</span> Notifications
              </Link>
              <Link to="/dashboard" onClick={toggleMobileMenu} className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold text-lg no-underline">
                <span className="text-2xl">📊</span> Dashboard
              </Link>
              <Link to="/profile" onClick={toggleMobileMenu} className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold text-lg no-underline">
                <span className="text-2xl">⚙️</span> My Profile
              </Link>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              <button onClick={handleLogout} className="text-left flex items-center gap-4 text-red-500 dark:text-red-400 font-bold text-lg">
                <span className="text-2xl">🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;