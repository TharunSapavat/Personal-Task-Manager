import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Flame,
  CheckCircle,
} from "lucide-react";
import { authAPI } from "../services/api";


export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Login successful!');
        navigate('/dashboard'); // Change to your dashboard route
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* LEFT – Branding */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 sm:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <Flame size={28} className="sm:w-[34px] sm:h-[34px]" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
                TaskStreak
              </h1>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold leading-snug mb-4 sm:mb-6">
              Stay consistent.  
              <br />
              Build winning streaks.
            </h2>

            <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-10 max-w-md">
              A personal task manager designed to help you
              complete daily goals, earn points, and maintain
              unstoppable streaks.
            </p>

            <div className="space-y-3 sm:space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle />
                Daily task completion tracking
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle />
                Points & streak rewards
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle />
                Productivity insights
              </div>
            </div>
          </div>

          <p className="text-xs opacity-70 hidden sm:block">
            © 2025 TaskStreak. All rights reserved.
          </p>
        </div>

        {/* RIGHT – Login Form */}
        <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">
            Welcome back 👋
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-10">
            Login to continue your productivity journey
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-indigo-600"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-indigo-600 font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition text-white py-3 rounded-xl font-medium shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-8">
            Don’t have an account?
            <button 
              onClick={() => navigate('/register')} 
              disabled={loading}
              className="text-indigo-600 font-medium ml-1 hover:underline"
            >
              Create One
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
