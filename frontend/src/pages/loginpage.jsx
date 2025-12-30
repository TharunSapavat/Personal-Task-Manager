import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Flame,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-full  flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white mt-10">

        {/* LEFT – Branding */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Flame size={34} />
              <h1 className="text-3xl font-bold tracking-wide">
                TaskStreak
              </h1>
            </div>

            <h2 className="text-4xl font-semibold leading-snug mb-6">
              Stay consistent.  
              <br />
              Build winning streaks.
            </h2>

            <p className="text-lg opacity-90 mb-10 max-w-md">
              A personal task manager designed to help you
              complete daily goals, earn points, and maintain
              unstoppable streaks.
            </p>

            <div className="space-y-4 text-sm">
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

          <p className="text-xs opacity-70">
            © 2025 TaskStreak. All rights reserved.
          </p>
        </div>

        {/* RIGHT – Login Form */}
        <div className="p-14 flex flex-col justify-center">
          <h3 className="text-2xl font-semibold mb-2">
            Welcome back 👋
          </h3>
          <p className="text-gray-500 mb-10">
            Login to continue your productivity journey
          </p>

          <form className="space-y-7">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition text-white py-3 rounded-xl font-medium shadow-md"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-8">
            Don’t have an account?
            <a
              href="#"
              className="text-indigo-600 font-medium ml-1 hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
