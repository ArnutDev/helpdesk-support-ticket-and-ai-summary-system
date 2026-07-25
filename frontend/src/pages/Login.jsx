import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await api.post("/auth/login", formData);
      const { access_token, role } = response.data;
      // Store token retrieved from backend
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role); // Still stored for basic role check
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert(
        "Login failed: " +
          (error.response?.data?.detail || "Please try again"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const ProtectedRoute = ({ children }) => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
      // If not admin, redirect to login page immediately
      return <Navigate to="/login" replace />;
    }

    // If admin, show Dashboard (children)
    return children;
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F5F7] overflow-x-hidden font-sans">
      {/* Left panel: Branding and features (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 text-white p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative background blur objects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 blur-3xl" />


        {/* Mid Section: Title & Details */}
        <div className="relative z-10 my-auto max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
            Helpdesk Support Ticket System
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-8">
            An intelligent ticket management system designed to streamline issue tracking and support workflows.
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
            <h3 className="font-semibold text-white flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI-Powered Ticket Summary</span>
            </h3>
            <p className="text-indigo-200/90 text-sm leading-relaxed">
              Instantly compile and synthesize complex ticket threads into concise, actionable summaries, empowering administrators to diagnose and prioritize issues in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-[#F5F5F7]">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-2xl shadow-slate-950/15 border border-slate-100 transition-all duration-200">
          

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 text-sm">Please sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email input field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 block">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Alternative actions */}
            <div className="text-center pt-2">
              <Link
                to="/register"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

