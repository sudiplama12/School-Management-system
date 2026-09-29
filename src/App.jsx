
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Route protection
import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// STUDENT
// =====================================================

import StudentDashboard, {
  DashboardHome,
} from "./pages/StudentDashboard";

import StudentProfile from "./pages/student/Profile";
import StudentJobs from "./pages/student/Jobs";
import StudentLibrary from "./pages/student/library";
import StudentAssignments from "./pages/student/Assignments";
import TakeAssignment from "./pages/student/TakeAssignment";
import StudentNotices from "./pages/student/Notices";
import StudentFee from "./pages/student/Fee";

// =====================================================
// TEACHER
// =====================================================

import TeacherDashboard, {
  TeacherHome,
} from "./pages/teacher/TeacherDashboard";

import TeacherStudents from "./pages/teacher/Students";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherNotices from "./pages/teacher/Notices";

// =====================================================
// PARENT
// =====================================================

import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentHome from "./pages/parent/ParentHome";
import ParentAssignments from "./pages/parent/Assignments";
import ParentNotices from "./pages/parent/Notices";
import ParentVisitHistory from "./pages/parent/VisitHistory";
import ParentSettings from "./pages/parent/Setting";
import ParentQueries from "./pages/parent/Queries";
import ParentLocationRequests from "./pages/parent/LocationRequests";

// =====================================================
// TEMPORARY PLACEHOLDER
// =====================================================

function Placeholder({ title }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This page is under development.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* =================================================
            STUDENT
        ================================================= */}

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
            element={<StudentProfile />}
          />

          {/* Jobs */}
          <Route
            path="jobs"
            element={<StudentJobs />}
          />

          {/* Applications */}
          <Route
            path="applications"
            element={
              <Placeholder title="My Applications" />
            }
          />

          {/* Notices */}
          <Route
            path="notices"
            element={<StudentNotices />}
          />

          {/* Library */}
          <Route
            path="library"
            element={<StudentLibrary />}
          />

          {/* Fee */}
          <Route
            path="fee"
            element={<StudentFee />}
          />

          {/* Location */}
          <Route
            path="location"
            element={
              <Placeholder title="My Location" />
            }
          />

          {/* Assignments */}
          <Route
            path="assignments"
            element={<StudentAssignments />}
          />

          {/* Take Assignment */}
          <Route
            path="assignments/take"
            element={<TakeAssignment />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={
              <Placeholder title="Settings" />
            }
          />
        </Route>


        {/* =================================================
            TEACHER
        ================================================= */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            index
            element={<TeacherHome />}
          />

          {/* Students */}
          <Route
            path="students"
            element={<TeacherStudents />}
          />

          {/* Attendance */}
          <Route
            path="attendance"
            element={<TeacherAttendance />}
          />

          {/* Assignments */}
          <Route
            path="assignments"
            element={<TeacherAssignments />}
          />

          {/* Notices */}
          <Route
            path="notices"
            element={<TeacherNotices />}
          />

          {/* =================================================
              HOME VISITS
          ================================================= */}

          <Route
            path="visits"
            element={
              <Placeholder title="Home Visits" />
            }
          />

          <Route
            path="visits/active"
            element={
              <Placeholder title="Active Visit" />
            }
          />

          <Route
            path="visits/location"
            element={
              <Placeholder title="Location" />
            }
          />

          <Route
            path="visits/student-location"
            element={
              <Placeholder title="Student Location" />
            }
          />

          <Route
            path="visits/upcoming"
            element={
              <Placeholder title="Upcoming Visits" />
            }
          />

          <Route
            path="visits/history"
            element={
              <Placeholder title="Visit History" />
            }
          />

          <Route
            path="visits/map"
            element={
              <Placeholder title="Visit Map" />
            }
          />

          {/* Vacancies */}
          <Route
            path="vacancies"
            element={
              <Placeholder title="Vacancies" />
            }
          />

          {/* Applications */}
          <Route
            path="applications"
            element={
              <Placeholder title="Applications" />
            }
          />

          {/* Profile */}
          <Route
            path="profile"
            element={
              <Placeholder title="Teacher Profile" />
            }
          />

          {/* Settings */}
          <Route
            path="settings"
            element={
              <Placeholder title="Teacher Settings" />
            }
          />
        </Route>


        {/* =================================================
            PARENT
        ================================================= */}

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            index
            element={<ParentHome />}
          />

          {/* My Child */}
          <Route
            path="student"
            element={
              <Placeholder title="My Child" />
            }
          />

          {/* Location Requests */}
          <Route
            path="location-request"
            element={<ParentLocationRequests />}
          />

          {/* Visit History */}
          <Route
            path="visits"
            element={<ParentVisitHistory />}
          />

          {/* Attendance */}
          <Route
            path="attendance"
            element={
              <Placeholder title="Attendance" />
            }
          />

          {/* Assignments */}
          <Route
            path="assignments"
            element={<ParentAssignments />}
          />

          {/* Notices */}
          <Route
            path="notices"
            element={<ParentNotices />}
          />

          {/* Queries */}
          <Route
            path="queries"
            element={<ParentQueries />}
          />

          {/* Fees */}
          <Route
            path="fees"
            element={
              <Placeholder title="Fees" />
            }
          />

          {/* Profile */}
          <Route
            path="profile"
            element={
              <Placeholder title="Parent Profile" />
            }
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<ParentSettings />}
          />
        </Route>


        {/* =================================================
            DEFAULT ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
