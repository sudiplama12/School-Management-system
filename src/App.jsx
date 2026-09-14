import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard, {
  DashboardHome,
} from "./pages/StudentDashboard";

import Profile from "./pages/student/Profile";
import Notice from "./pages/student/notice";
import Fee from "./pages/student/fee";
import Library from "./pages/student/library";

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

        {/* ================= LOGIN & REGISTER ================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


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
          <Route
            index
            element={<DashboardHome />}
          />


          {/* Profile */}
          <Route
            path="profile"
            element={<Profile />}
          />


          {/* Jobs */}
          <Route
            path="jobs"
            element={
              <Placeholder title="Jobs & Internships" />
            }
          />


          {/* Job Details */}
          <Route
            path="jobs/:id"
            element={
              <Placeholder title="Job Details" />
            }
          />


          {/* Applications */}
          <Route
            path="applications"
            element={
              <Placeholder title="My Applications" />
            }
          />


          {/* Fee */}
          <Route
            path="fee"
            element={<Fee />}
          />


          {/* Library */}
          <Route
            path="library"
            element={<Library />}
          />


          {/* Notices */}
          <Route
            path="notices"
            element={<Notice />}
          />


          {/* Home Location */}
          <Route
            path="location"
            element={
              <Placeholder title="Home Location" />
            }
          />


          {/* Assignments */}
          <Route
            path="assignments"
            element={
              <Placeholder title="Assignments" />
            }
          />


          {/* Settings */}
          <Route
            path="settings"
            element={
              <Placeholder title="Settings" />
            }
          />

        </Route>


        {/* ================= DEFAULT ================= */}

        <Route
          path="/"
          element={
            <Navigate to="/login" replace />
          }
        />


        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={
            <Navigate to="/login" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}