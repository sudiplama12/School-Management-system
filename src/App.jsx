import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import SchoolReveal from "./components/SchoolReveal";
import { useAuth } from "./context/AuthContext";

// Student
import StudentDashboard, { DashboardHome } from "./pages/StudentDashboard";
import StudentProfile from "./pages/student/Profile";
import StudentJobs from "./pages/student/Jobs";
import StudentLibrary from "./pages/student/library";
import StudentAssignments from "./pages/student/Assignments";
import TakeAssignment from "./pages/student/TakeAssignment";
import StudentNotices from "./pages/student/Notices";
import StudentFee from "./pages/student/Fee";
import StudentApplications from "./pages/student/application";

// Teacher
import TeacherDashboard, { TeacherHome } from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/Students";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherNotices from "./pages/teacher/Notices";

// Parent
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentHome from "./pages/parent/ParentHome";
import ParentAssignments from "./pages/parent/Assignments";
import ParentNotices from "./pages/parent/Notices";
import ParentVisitHistory from "./pages/parent/VisitHistory";
import ParentVisitRequests from "./pages/parent/VisitRequests";
import ParentSettings from "./pages/parent/Setting";
import ParentQueries from "./pages/parent/Queries";
import ParentLocationRequests from "./pages/parent/LocationRequests";
import ParentStudentDetails from "./pages/parent/StudentDetails";
import ParentAttendance from "./pages/parent/Attendence";
import ParentFees from "./pages/parent/Fees";
import ParentStudentLocation from "./pages/parent/StudentLocation";

// Teacher home visits
import ActiveVisit from "./pages/teacher/HomeVisit/ActiveVisit";
import VisitLocation from "./pages/teacher/HomeVisit/Location";
import StudentLocationMap from "./pages/teacher/HomeVisit/StudentLocation";
import UpcomingVisits from "./pages/teacher/HomeVisit/Upcoming";
import TeacherVisitHistory from "./pages/teacher/HomeVisit/VisitHistory";

// Admin
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminParents from "./pages/admin/Parents";
import AdminPermissions from "./pages/admin/Permissions";
import AdminUsers from "./pages/admin/Users";
import AdminLibrary from "./pages/admin/Library";
import AdminFees from "./pages/admin/Fees";

// Temporary placeholder for pages not built yet
function Placeholder({ title }) {  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="rounded-2xl bg-card p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          This page is under development.
        </p>
      </div>
    </div>
  );
}

const ROLE_HOME = {
  admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

// Sends an authenticated user to their role home and everyone else to login,
// so dead links never bounce a signed-in user back through /login.
function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  const home = ROLE_HOME[user?.role];
  return <Navigate to={home || "/login"} replace />;
}

// One curtain per sign-in: the school's name is withheld from the auth screens
// and revealed here while the portal mounts behind it.
function RevealGate() {
  const { reveal, clearReveal, school, user } = useAuth();

  if (!reveal) return null;

  return (
    <SchoolReveal
      key={reveal}
      school={school}
      user={user}
      onDone={clearReveal}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RevealGate />
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="fee" element={<StudentFee />} />
          <Route path="location" element={<Placeholder title="My Location" />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="assignments/take" element={<TakeAssignment />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>

        {/* Teacher */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherHome />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="notices" element={<TeacherNotices />} />

          {/* Home visits */}
          <Route path="visits" element={<UpcomingVisits />} />
          <Route path="visits/active" element={<ActiveVisit />} />
          <Route path="visits/location" element={<VisitLocation />} />
          <Route path="visits/student-location" element={<StudentLocationMap />} />
          <Route path="visits/upcoming" element={<UpcomingVisits />} />
          <Route path="visits/history" element={<TeacherVisitHistory />} />
          <Route path="visits/map" element={<Placeholder title="Visit Map" />} />

          <Route path="vacancies" element={<Placeholder title="Vacancies" />} />
          <Route path="applications" element={<Placeholder title="Applications" />} />
          <Route path="profile" element={<Placeholder title="Teacher Profile" />} />
          <Route path="settings" element={<Placeholder title="Teacher Settings" />} />
        </Route>

        {/* Parent */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentHome />} />
          <Route path="student" element={<ParentStudentDetails />} />
          <Route path="student-location" element={<ParentStudentLocation />} />
          <Route path="location-requests" element={<ParentLocationRequests />} />
          <Route path="location-request" element={<ParentLocationRequests />} />
          <Route path="visits" element={<ParentVisitHistory />} />
          <Route path="visit-requests" element={<ParentVisitRequests />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="assignments" element={<ParentAssignments />} />
          <Route path="notices" element={<ParentNotices />} />
          <Route path="queries" element={<ParentQueries />} />
          <Route path="fees" element={<ParentFees />} />
          <Route path="profile" element={<Placeholder title="Parent Profile" />} />
          <Route path="settings" element={<ParentSettings />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="parents" element={<AdminParents />} />
          <Route path="classes" element={<Placeholder title="Classes" />} />
          <Route path="teacher-attendance" element={<Placeholder title="Teacher Attendance" />} />
          <Route path="attendance" element={<Placeholder title="Student Attendance" />} />
          <Route path="library" element={<AdminLibrary />} />
          <Route path="library/books" element={<AdminLibrary />} />
          <Route path="library/issue" element={<AdminLibrary />} />
          <Route path="library/return" element={<AdminLibrary />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Default routes */}
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}