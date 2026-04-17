import React, { useState, useEffect, useRef } from "react";

const CollegeSelect = ({ onSelect }) => {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch("./CollegeData.json")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setColleges(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching colleges:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredColleges([]);
    } else {
      const results = colleges.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      // Limit to 50 to prevent massive DOM lag on mobile
      setFilteredColleges(results.slice(0, 50));
    }
  }, [search, colleges]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (college) => {
    setSearch(college.name);
    setIsOpen(false);
    const domain = college.domains && college.domains.length > 0 ? college.domains[0] : "";
    
    onSelect(college.name, domain);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
        College Name <span className="text-red-500 dark:text-red-400">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={loading ? "Loading colleges..." : "Type to search..."}
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors shadow-sm"
          disabled={loading}
        />
        {loading && (
          <div className="absolute right-4 top-3.5 animate-spin h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
        )}
      </div>

      {isOpen && filteredColleges.length > 0 && (
        <ul className="absolute z-20 w-full mt-1.5 max-h-60 overflow-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl transition-all">
          {filteredColleges.map((college, index) => (
            <li
              key={index}
              onClick={() => handleSelect(college)}
              className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-800 dark:text-slate-200 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
            >
              <div className="font-bold">{college.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {college.domains ? college.domains[0] : "No domain"}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && search && filteredColleges.length === 0 && !loading && (
        <div className="absolute z-20 w-full mt-1.5 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-sm text-slate-500 dark:text-slate-400 transition-colors">
          No college found. You can continue typing manually.
        </div>
      )}
    </div>
  );
};

export default CollegeSelect;