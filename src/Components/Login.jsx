import { useState, useContext } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(password);
};

const Login = () => {
  const [data, setdata] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { loginUser } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...data };

    if (!validatePassword(finalData.password)) {
      toast.error("Invalid Password Format");
      return;
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/login", finalData)
      .then((res) => {
        toast.success("Authentication successful");
        loginUser(res.data.user, res.data.token);
        navigate("/");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Invalid Login Credentials");
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-5xl">🎓</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            Create one today
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl dark:shadow-slate-900/50 sm:rounded-3xl sm:px-10 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                className="block w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                placeholder="you@example.com"
                onChange={(e) => {
                  setdata({ ...data, email: e.target.value });
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/updatepwd"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <input
                type="password"
                required
                className="block w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                onChange={(e) => setdata({ ...data, password: e.target.value })}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm font-medium text-slate-900 dark:text-slate-300"
              >
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-all active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
