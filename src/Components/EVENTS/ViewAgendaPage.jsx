import React from "react";

const ViewAgendaPage = () => {
  const schedule = [
    {
      time: "09:00 AM",
      title: "Registration & Breakfast",
      desc: "Check-in at the Main Auditorium lobby.",
    },
    {
      time: "10:30 AM",
      title: "Opening Ceremony",
      desc: "Welcome address by the Dean and Student Council.",
    },
    {
      time: "11:30 AM",
      title: "Keynote: Future of Tech",
      desc: "Speaker: Mr. Sharma (CTO of TechCorp, Batch '98).",
    },
    {
      time: "01:00 PM",
      title: "Networking Lunch",
      desc: "Buffet served at the Central Lawn.",
    },
    {
      time: "03:00 PM",
      title: "Department Visits",
      desc: "Visit your old classrooms and labs.",
    },
    {
      time: "06:00 PM",
      title: "Gala Dinner & DJ",
      desc: "Evening entertainment and networking.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 md:py-16 px-4 sm:px-6 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 md:mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight transition-colors">
            Event Agenda
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 transition-colors">
            The Grand Alumni Homecoming 2026
          </p>
          <div className="mt-4 inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors">
            Date: 15th October 2026
          </div>
        </div>

        {/* Timeline Section */}
        <div className="relative border-l-4 border-blue-200 dark:border-slate-700 ml-4 md:ml-10 space-y-8 md:space-y-12 transition-colors">
          {schedule.map((item, index) => (
            <div key={index} className="relative pl-6 md:pl-12 group">
              
              {/* Timeline Dot */}
              <div className="absolute -left-[14px] top-1.5 bg-white dark:bg-slate-900 border-4 border-blue-600 dark:border-blue-500 w-6 h-6 rounded-full group-hover:scale-125 transition-all duration-300 shadow-sm"></div>

              {/* Content Card */}
              <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 cursor-default">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xs md:text-sm tracking-wider uppercase block mb-2 transition-colors">
                  {item.time}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 transition-colors leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-12 md:mt-16 text-center">
          <button className="w-full sm:w-auto bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 md:py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]">
            Download PDF Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAgendaPage;