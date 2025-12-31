import React from 'react'
import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from './pages/loginpage.jsx'
import RegisterPage from './pages/registerpage.jsx'
import Dashboard from './pages/dashboard.jsx'
import TasksPage from './pages/taskspage.jsx'
import StreaksPage from './pages/streakspage.jsx'
import SettingsPage from './pages/settingspage.jsx'

function App() {

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/streaks" element={<StreaksPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
