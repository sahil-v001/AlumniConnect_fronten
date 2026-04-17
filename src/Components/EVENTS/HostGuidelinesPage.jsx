import React from "react";

const HostGuidelinesPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 md:py-16 px-6 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 transition-colors">
          Host Guidelines & Policies
        </h1>

        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
          Thank you for your interest in giving back to the community. As an
          alumni host, you play a pivotal role in shaping the future of our
          students. Please review the following guidelines before submitting a
          proposal.
        </p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* DO'S PANEL */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 transition-colors">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
              <span>✅</span> Do's
            </h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li>Focus on educational or networking value.</li>
              <li>Be punctual and respectful of time.</li>
              <li>Provide clear learning outcomes.</li>
              <li>Engage with students and answer queries.</li>
            </ul>
          </div>

          {/* DON'TS PANEL */}
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800/30 transition-colors">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
              <span>❌</span> Don'ts
            </h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li>No direct selling of products or services.</li>
              <li>Avoid political or religious topics.</li>
              <li>Do not share student data with third parties.</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            How it works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold mr-4 shadow-sm">
                1
              </div>
              <p className="text-slate-700 dark:text-slate-300 pt-1 leading-relaxed">
                Submit your proposal using the online form.
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold mr-4 shadow-sm">
                2
              </div>
              <p className="text-slate-700 dark:text-slate-300 pt-1 leading-relaxed">
                The Alumni Committee reviews your application (24-48 hrs).
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold mr-4 shadow-sm">
                3
              </div>
              <p className="text-slate-700 dark:text-slate-300 pt-1 leading-relaxed">
                Once approved, the event is listed on the Events Dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-6 md:p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700 transition-colors">
          <p className="text-slate-700 dark:text-slate-300">
            Need help? Contact the support team at{" "}
            <a href="mailto:support@alumni.edu" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              support@alumni.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostGuidelinesPage;