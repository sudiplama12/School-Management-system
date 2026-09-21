import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================
import Login from "./pages/Login";
import Register from "./pages/Register";

// =====================================================
// STUDENT PAGES
// =====================================================
import StudentDashboard, {
  DashboardHome,
} from "./pages/StudentDashboard";

import Profile from "./pages/student/Profile";
import Jobs from "./pages/student/Jobs";
import Library from "./pages/student/library";
import StudentAssignments from "./pages/student/Assignments";
import TakeAssignment from "./pages/student/TakeAssignment";
import StudentNotices from "./pages/student/Notices";
import Fee from "./pages/student/Fee";

// =====================================================
// TEACHER PAGES
// =====================================================
import TeacherDashboard, {
  TeacherHome,
} from "./pages/teacher/TeacherDashboard";

import Students from "./pages/teacher/Students";
import Attendance from "./pages/teacher/Attendance";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherNotices from "./pages/teacher/Notices";

// =====================================================
// TEACHER HOME VISIT PAGES
// =====================================================
import Location from "./pages/teacher/homevisit/Location";
import StudentLocation from "./pages/teacher/homevisit/StudentLocation";
import Upcoming from "./pages/teacher/homevisit/Upcoming";
import ActiveVisit from "./pages/teacher/homevisit/ActiveVisit";
import VisitHistory from "./pages/teacher/homevisit/VisitHistory";

// =====================================================
// PARENT PAGE
// =====================================================
import StudentLocationRequest from "./pages/parent/StudentLocation";

// =====================================================
// AUTHENTICATION
// =====================================================
import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// PLACEHOLDER
// =====================================================
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

// =====================================================
// APP
// =====================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            STUDENT ROUTES
        ================================================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          {/* /student */}
          <Route
            index
            element={<DashboardHome />}
          />

          {/* /student/profile */}
          <Route
            path="profile"
            element={<Profile />}
          />

          {/* /student/jobs */}
          <Route
            path="jobs"
            element={<Jobs />}
          />

          {/* /student/applications */}
          <Route
            path="applications"
            element={
              <Placeholder title="My Applications" />
            }
          />

          {/* /student/notices */}
          <Route
            path="notices"
            element={<StudentNotices />}
          />

          {/* /student/library */}
          <Route
            path="library"
            element={<Library />}
          />

          {/* /student/fee */}
          <Route
            path="fee"
            element={<Fee />}
          />

          {/* /student/location */}
          <Route
            path="location"
            element={
              <Placeholder title="Home Location" />
            }
          />

          {/* /student/assignments */}
          <Route
            path="assignments"
            element={<StudentAssignments />}
          />

          {/* /student/assignments/take */}
          <Route
            path="assignments/take"
            element={<TakeAssignment />}
          />

          {/* /student/settings */}
          <Route
            path="settings"
            element={
              <Placeholder title="Settings" />
            }
          />
        </Route>

        {/* =================================================
            TEACHER ROUTES
        ================================================= */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        >
          {/* /teacher */}
          <Route
            index
            element={<TeacherHome />}
          />

          {/* /teacher/students */}
          <Route
            path="students"
            element={<Students />}
          />

          {/* /teacher/attendance */}
          <Route
            path="attendance"
            element={<Attendance />}
          />

          {/* /teacher/assignments */}
          <Route
            path="assignments"
            element={<TeacherAssignments />}
          />

          {/* /teacher/notices */}
          <Route
            path="notices"
            element={<TeacherNotices />}
          />

          {/* =================================================
              HOME VISIT ROUTES
          ================================================= */}

          {/* /teacher/visits/location */}
          <Route
            path="visits/location"
            element={<StudentLocation />}
          />

          {/* /teacher/visits/upcoming */}
          <Route
            path="visits/upcoming"
            element={<Upcoming />}
          />

          {/* /teacher/visits/active */}
          <Route
            path="visits/active"
            element={<ActiveVisit />}
          />

          {/* /teacher/visits/history */}
          <Route
            path="visits/history"
            element={<VisitHistory />}
          />

          {/* /teacher/visits/map */}
          <Route
            path="visits/map"
            element={<Location />}
          />

          {/* =================================================
              OTHER TEACHER ROUTES
          ================================================= */}

          {/* /teacher/vacancies */}
          <Route
            path="vacancies"
            element={
              <Placeholder title="Manage Vacancies" />
            }
          />

          {/* /teacher/vacancies/create */}
          <Route
            path="vacancies/create"
            element={
              <Placeholder title="Post Vacancy" />
            }
          />

          {/* /teacher/applications */}
          <Route
            path="applications"
            element={
              <Placeholder title="Student Applications" />
            }
          />

          {/* /teacher/profile */}
          <Route
            path="profile"
            element={
              <Placeholder title="Teacher Profile" />
            }
          />

          {/* /teacher/settings */}
          <Route
            path="settings"
            element={
              <Placeholder title="Settings" />
            }
          />
        </Route>

        {/* =================================================
            PARENT ROUTES
        ================================================= */}

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <Placeholder title="Parent Dashboard" />
            </ProtectedRoute>
          }
        >
          {/* /parent */}
          <Route
            index
            element={
              <Placeholder title="Parent Dashboard" />
            }
          />

          {/* /parent/location-request */}
          <Route
            path="location-request"
            element={<StudentLocationRequest />}
          />
        </Route>

        {/* =================================================
            DEFAULT ROUTES
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}