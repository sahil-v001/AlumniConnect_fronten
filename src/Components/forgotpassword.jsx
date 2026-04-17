import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config";

const Updatepwd = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [Loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (email.includes("@")) {
      setLoading(true);
      setMessage("");
      try {
        const res = await API.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/verify-email",
          {
            email,
            isUpdatePassword: true,
          },
        );
        setMessage(res.data);
        setStep(2);
      } catch (err) {
        setMessage(err.response?.data || "Error sending OTP");
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("Please enter a valid email");
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await API.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/verify-otp",
        {
          email,
          otp,
        },
      );
      setStep(3);
      setMessage(res.data);
    } catch (err) {
      setMessage(err.response?.data || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword === confirmPassword && newPassword !== "") {
      setLoading(true);
      try {
        const res = await API.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/changepwd",
          {
            email,
            newPassword,
          },
        );
        setMessage(res.data);
        setStep(4); // Advance to success step
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        setMessage(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("Passwords do not match");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center w-full px-4 transition-colors duration-300 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        {message && step !== 4 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-center font-medium mb-6 text-sm transition-colors">
            {message}
          </div>
        )}

        {/* STEP 1: Email */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white transition-colors">
                Reset Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 transition-colors">
                Enter your registered institute email to receive an OTP.
              </p>
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Enter Institute Email ID"
                value={email}
                disabled={Loading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
            </div>
            <button
              disabled={Loading}
              onClick={handleSendOtp}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] ${
                Loading 
                  ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
              }`}
            >
              {Loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-2"
            >
              &larr; Back to Login
            </button>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white transition-colors">
                Verify OTP
              </h2>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl text-center text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
              OTP sent to: <br/><span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                disabled={Loading}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
            </div>
            <button
              disabled={Loading}
              onClick={handleVerifyOtp}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] ${
                Loading 
                  ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 hover:shadow-lg"
              }`}
            >
              {Loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button 
              onClick={() => setStep(1)}
              className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-2"
            >
              &larr; Use a different email
            </button>
          </div>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white transition-colors">
                Set New Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 transition-colors">
                Please create a strong password.
              </p>
            </div>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                disabled={Loading}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                disabled={Loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
            </div>
            <button
              disabled={Loading}
              onClick={handleUpdatePassword}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] ${
                Loading 
                  ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
              }`}
            >
              {Loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2 transition-colors">Success!</h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium transition-colors">Your password has been updated.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-4 animate-pulse transition-colors">Redirecting to login...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Updatepwd;