import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Route protection
import ProtectedRoute from "./components/ProtectedRoute";

// Student
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

// Teacher
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

// Parent
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentAssignments from "./pages/parent/Assignments";

// Temporary placeholder
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

        {/* ==================== AUTH ==================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* ==================== STUDENT ==================== */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          {/* Student Dashboard */}
          <Route index element={<DashboardHome />} />

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


        {/* ==================== TEACHER ==================== */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<TeacherHome />} />

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


          {/* ========== HOME VISIT ========== */}

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


        {/* ==================== PARENT ==================== */}

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
            element={
              <Placeholder title="Parent Dashboard" />
            }
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
            element={
              <Placeholder title="Location Requests" />
            }
          />

          {/* Visit History */}
          <Route
            path="visits"
            element={
              <Placeholder title="Visit History" />
            }
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
            element={
              <Placeholder title="Notices" />
            }
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
            element={
              <Placeholder title="Parent Settings" />
            }
          />
        </Route>


        {/* ==================== DEFAULT ==================== */}

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