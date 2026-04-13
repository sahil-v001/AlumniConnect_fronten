import React, { useState, useContext } from "react"; // 1. Import useContext
import { Link, NavLink, useNavigate } from "react-router-dom";
import NotificationDropdown from './NotificationDropDown';
import { UserContext } from '../context/UserContext'; // 2. Import your UserContext

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 3. Extract user state and logout function from Context
  const { user, logoutUser } = useContext(UserContext); 

  // 4. Derive isLoggedIn dynamically from the Context state
  const isLoggedIn = !!user; 

  const handleLogout = () => {
    logoutUser(); // 5. Let Context handle the state and localStorage wipe
    setIsDropdownOpen(false);
    navigate("/login"); 
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navLinkStyles = ({ isActive }) =>
    `no-underline text-base transition-all duration-300 pb-1 ${
      isActive
        ? "text-blue-600 font-bold border-b-2 border-blue-600"
        : "text-gray-600 font-semibold hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white h-[80px] w-full flex items-center px-[5%] shadow-md sticky top-0 z-[1000] tracking-wide">
      <div className="flex-1 flex justify-start">
        <Link
          to="/"
          className="text-[24px] font-extrabold text-blue-600 flex items-center gap-2 cursor-pointer no-underline tracking-tight"
        >
          <span>🎓</span> AlumniConnect
        </Link>
      </div>

      <ul className="list-none flex flex-[2] justify-center gap-8 m-0 p-0 max-lg:hidden">
        <li>
          <NavLink to="/" className={navLinkStyles}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={navLinkStyles}>
            Events
          </NavLink>
        </li>
        <li>
          <NavLink to="/jobs" className={navLinkStyles}>
            Jobs & Referrals
          </NavLink>
        </li>
      </ul>

      <div className="flex-1 flex justify-end gap-[15px] max-md:hidden items-center relative">
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="inline-block px-[24px] py-[10px] rounded-md font-semibold text-[14px] border-2 border-blue-600 text-blue-600 bg-transparent transition-all duration-300 hover:bg-blue-50 cursor-pointer"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-[24px] py-[10px] rounded-md font-semibold text-[14px] border-2 border-blue-600 bg-blue-600 text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:-translate-y-[1px] no-underline"
            >
              Join Network
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4"> 
            
            {/* 1. The Notification Bell */}
            <NotificationDropdown />

            {/* 2. NEW: The Messages/Chat Button */}
            <Link
              to="/chat"
              title="Messages"
              className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors focus:outline-none no-underline"
            >
              <span className="text-[20px]">💬</span>
            </Link>

            {/* 3. The Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-[40px] h-[40px] rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors focus:outline-none"
              >
                <span className="text-[20px]">👤</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-[50px] w-[200px] bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden py-2 flex flex-col z-[1100]">
                  <Link
                    to="/dashboard"
                    className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 no-underline font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>📊</span> Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 no-underline font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>⚙️</span> My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;