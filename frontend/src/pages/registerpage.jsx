import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Flame,
  CheckCircle,
  User,
} from "lucide-react";
import { authAPI } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({ name, email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Registration successful!');
        navigate('/login');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* LEFT – Branding */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Flame size={24} className="sm:w-[28px] sm:h-[28px]" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
                TaskStreak
              </h1>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold leading-snug mb-3 sm:mb-4">
              Start your journey.  
              <br />
              Build winning habits.
            </h2>

            <p className="text-sm sm:text-base opacity-90 mb-4 sm:mb-6 max-w-md">
              Join thousands of users who are crushing their goals
              and building unstoppable momentum every day.
            </p>

            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                Daily task completion tracking
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                Points & streak rewards
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                Productivity insights
              </div>
            </div>
          </div>

          <p className="text-xs opacity-70 hidden sm:block">
            © 2025 TaskStreak. All rights reserved.
          </p>
        </div>

        {/* RIGHT – Register Form */}
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <h3 className="text-xl font-semibold mb-1">
            Create your account 🚀
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            Start tracking your productivity today
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  name='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="email"
                  name='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                required
                disabled={loading}
                className="accent-indigo-600 mt-0.5"
              />
              <label className="text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-indigo-600 font-medium hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-600 font-medium hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition text-white py-2.5 rounded-lg font-medium shadow-md text-sm disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-4">
            Already have an account?
            <button
              onClick={() => navigate('/login')}
              disabled={loading}
              className="text-indigo-600 font-medium ml-1 hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
