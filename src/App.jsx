
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

// Teacher Home Visit
import ActiveVisit from "./pages/teacher/homevisit/ActiveVisit";
import Location from "./pages/teacher/homevisit/Location";
import StudentLocation from "./pages/teacher/homevisit/StudentLocation";
import Upcoming from "./pages/teacher/homevisit/Upcoming";
import VisitHistory from "./pages/teacher/homevisit/VisitHistory";

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

// Location Request
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
            AUTH
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
          <Route index element={<DashboardHome />} />

          <Route
            path="profile"
            element={<StudentProfile />}
          />

          <Route
            path="jobs"
            element={<StudentJobs />}
          />

          <Route
            path="applications"
            element={
              <Placeholder title="My Applications" />
            }
          />

          <Route
            path="notices"
            element={<StudentNotices />}
          />

          <Route
            path="library"
            element={<StudentLibrary />}
          />

          <Route
            path="fee"
            element={<StudentFee />}
          />

          <Route
            path="location"
            element={
              <Placeholder title="My Location" />
            }
          />

          <Route
            path="assignments"
            element={<StudentAssignments />}
          />

          <Route
            path="assignments/take"
            element={<TakeAssignment />}
          />

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
          <Route index element={<TeacherHome />} />

          <Route
            path="students"
            element={<TeacherStudents />}
          />

          <Route
            path="attendance"
            element={<TeacherAttendance />}
          />

          <Route
            path="assignments"
            element={<TeacherAssignments />}
          />

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
            element={<ActiveVisit />}
          />

          <Route
            path="visits/location"
            element={<Location />}
          />

          <Route
            path="visits/student-location"
            element={<StudentLocation />}
          />

          <Route
            path="visits/upcoming"
            element={<Upcoming />}
          />

          <Route
            path="visits/history"
            element={<VisitHistory />}
          />

          <Route
            path="visits/map"
            element={
              <Placeholder title="Visit Map" />
            }
          />

          <Route
            path="vacancies"
            element={
              <Placeholder title="Vacancies" />
            }
          />

          <Route
            path="applications"
            element={
              <Placeholder title="Applications" />
            }
          />

          <Route
            path="profile"
            element={
              <Placeholder title="Teacher Profile" />
            }
          />

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
          {/* Parent Dashboard */}
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
            DEFAULT
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
