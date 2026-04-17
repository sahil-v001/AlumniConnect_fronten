import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NotificationDropdown = () => {
  const { user } = useContext(UserContext);

  if (!user) return null;

  // Filter out read notifications to get the badge count
  const unreadCount = user.notifications?.filter(n => !n.isRead).length || 0;

  return (
    <Link 
      to="/notifications"
      className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-slate-600 transition-all focus:outline-none no-underline active:scale-90 shadow-sm"
      aria-label="View notifications"
    >
      <span className="text-xl">🔔</span>
      
      {/* Red Badge for Unread Notifications */}
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in duration-300">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationDropdown;