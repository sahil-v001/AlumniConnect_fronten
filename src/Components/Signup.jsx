import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CollegeSelect from './CollegeSelect';
import axios from 'axios';
import { validatePassword } from './Login';
import toast from 'react-hot-toast';
import { UserContext } from '../context/UserContext';

const Signup = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(UserContext);
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: "",
    collegeName: "",
    graduationYear: "",
    emailPrefix: "",
    emailDomain: "",
    password: "",
    otp: "",
    isVerified: false,
  });

  const currentYear = new Date().getFullYear();
  const isAlumni = formData.graduationYear && parseInt(formData.graduationYear) <= currentYear;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleGradYearChange = (e) => {
    const newYear = e.target.value;
    const isNowAlumni = newYear && parseInt(newYear) <= currentYear;

    if (isAlumni !== isNowAlumni) {
      setFormData({ 
        ...formData, 
        graduationYear: newYear, 
        emailPrefix: "", 
        isVerified: false, 
        otp: "" 
      });
      setIsOtpSent(false);
      setTimer(0);
    } else {
      setFormData({ ...formData, graduationYear: newYear });
    }
  };

  const handleCollegeSelect = (name, domain) => {
    setFormData((prev) => ({
      ...prev,
      collegeName: name,
      emailDomain: domain ? `@${domain}` : "",
    }));
  };

  const getFinalEmail = () => {
    return isAlumni ? formData.emailPrefix : `${formData.emailPrefix}${formData.emailDomain}`;
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (isLoading || timer > 0) return;
    if (!formData.collegeName) return toast.error("Please select your college first");
    if (!formData.emailPrefix) return toast.error("Please enter your email");

    setIsLoading(true);
    const email = getFinalEmail();

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/verify-email", { email })
      .then((res) => {
        toast.success(res.data);
        setIsOtpSent(true);
        setTimer(30);
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data || "Something went wrong";
        toast.error(typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg);
        setIsOtpSent(false);
      })
      .finally(() => setIsLoading(false));
  };

  const handleOtp = (e) => {
    e.preventDefault();
    if (!formData.otp.length) return toast.error("Enter valid otp");

    setIsLoading(true);
    const payLoad = { email: getFinalEmail(), otp: formData.otp };

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/verify-otp", payLoad)
      .then((res) => {
        setFormData((prev) => ({ ...prev, isVerified: true }));
        toast.success(res.data.message);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Verification failed"))
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!formData.isVerified) return toast.error("Please verify your email first.");

    const finalData = { ...formData, email: getFinalEmail() };

    if (!validatePassword(finalData.password)) {
      toast.error("Password must contain: 1 Uppercase, 1 Number, 1 Symbol");
    } else {
      setIsLoading(true);
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/signup", finalData)
        .then((res) => {
          if (res.data.token) {
            loginUser(res.data.user, res.data.token); 
            toast.success("Signup successful!");
            navigate('/');
          } else {
            toast.success("Account created! Please log in.");
            navigate('/login');
          }
        })
        .catch((err) => toast.error(err.response?.data?.msg || "Signup failed"))
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <span className="text-5xl">🤝</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Join the Alumni Network
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 md:px-10 shadow-xl dark:shadow-slate-950/50 rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {/* GRADUATION YEAR */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                placeholder={`e.g. ${currentYear}`}
                value={formData.graduationYear}
                onChange={handleGradYearChange}
              />
              {formData.graduationYear && (
                <div className={`mt-2 p-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border transition-colors ${
                  isAlumni 
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" 
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50"
                }`}>
                  {isAlumni ? "🎓 Alumni Mode" : "📚 Student Mode: Official ID required"}
                </div>
              )}
            </div>

            {/* COLLEGE SELECT */}
            <div className={`transition-opacity ${isOtpSent || formData.isVerified ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
              <CollegeSelect onSelect={handleCollegeSelect} />
            </div>

            {/* EMAIL SECTION */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAlumni ? "Personal Email ID" : "College Email ID"} <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-1 items-stretch">
                  {isAlumni ? (
                    <input
                      type="email"
                      required
                      disabled={isOtpSent || formData.isVerified}
                      placeholder="john.doe@gmail.com"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
                      value={formData.emailPrefix}
                      onChange={(e) => setFormData({ ...formData, emailPrefix: e.target.value })}
                    />
                  ) : (
                    <div className="flex w-full">
                      <input
                        type="text"
                        required
                        disabled={isOtpSent || formData.isVerified}
                        placeholder="student_id"
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-l-xl px-4 py-3 text-slate-900 dark:text-white border-r-0 disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-colors"
                        value={formData.emailPrefix}
                        onChange={(e) => setFormData({ ...formData, emailPrefix: e.target.value })}
                      />
                      <div className="flex items-center px-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-r-xl text-slate-500 dark:text-slate-300 text-sm font-bold">
                        {formData.emailDomain || "@domain.edu"}
                      </div>
                    </div>
                  )}
                </div>
                {!isOtpSent && !formData.isVerified && (
                  <button
                    onClick={handleVerify}
                    disabled={isLoading || !formData.graduationYear}
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "..." : "Verify"}
                  </button>
                )}
              </div>

              {/* OTP SECTION */}
              {isOtpSent && !formData.isVerified && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-300">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 text-center">
                    Verification Code sent to <span className="text-blue-600 dark:text-blue-400 lowercase">{getFinalEmail()}</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl py-3 text-center text-xl font-black tracking-[0.5em] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                      onClick={handleOtp}
                    >
                      OK
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:text-slate-400"
                      onClick={handleVerify}
                      disabled={timer > 0}
                    >
                      {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !formData.isVerified}
                className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-all active:scale-[0.98] ${
                  isLoading || !formData.isVerified 
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50" 
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20"
                }`}
              >
                {isLoading ? "Creating Account..." : "Join Network"}
              </button>
              {!formData.isVerified && (
                <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-3">
                  * Email verification required to finish signup
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;