import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard, {
  DashboardHome,
} from "./pages/StudentDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
// Temporary page component
function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800">
        {title}
      </h1>

      <p className="mt-2 text-slate-500">
        This page is ready for development.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= LOGIN ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />}
/>

        {/* ================= STUDENT ================= */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardHome />} />

          {/* Profile */}
          <Route
            path="profile"
            element={<Placeholder title="Student Profile" />}
          />

          {/* Jobs */}
          <Route
            path="jobs"
            element={<Placeholder title="Jobs & Internships" />}
          />

          {/* Job Details */}
          <Route
            path="jobs/:id"
            element={<Placeholder title="Job Details" />}
          />

          {/* Applications */}
          <Route
            path="applications"
            element={<Placeholder title="My Applications" />}
          />

          {/* Home Location */}
          <Route
            path="location"
            element={<Placeholder title="Home Location" />}
          />

          {/* Assignments */}
          <Route
            path="assignments"
            element={<Placeholder title="Assignments" />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* ================= DEFAULT ================= */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}