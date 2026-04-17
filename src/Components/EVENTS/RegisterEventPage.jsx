import React from "react";
import { Link } from "react-router-dom"; // Use Link for client-side routing

const RegisterEventPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Event Registration
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Secure your spot for{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              The Grand Alumni Homecoming 2026
            </span>
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors shadow-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors shadow-sm"
                placeholder="john@example.com"
              />
            </div>

            {/* Passing Year */}
            <div>
              <label
                htmlFor="batch"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Passing Year
              </label>
              <input
                id="batch"
                name="batch"
                type="number"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors shadow-sm"
                placeholder="2022"
              />
            </div>

            {/* Dietary Preference */}
            <div>
              <label
                htmlFor="diet"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Dietary Preference
              </label>
              <select
                id="diet"
                name="diet"
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors shadow-sm"
              >
                <option>None</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Gluten Free</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Confirm Registration
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/events"
              className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              &larr; Cancel and go back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEventPage;