import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  MapPin,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  BookOpen,
  CreditCard,
  CalendarCheck,
  ClipboardList,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    path: "/student",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Profile",
    path: "/student/profile",
    icon: User,
  },
  {
    name: "Jobs",
    path: "/student/jobs",
    icon: Briefcase,
  },
  {
    name: "Applications",
    path: "/student/applications",
    icon: FileText,
  },
  
  {
    name: "Notices",
    path: "/student/notices",
    icon: Bell,
  },
  {
    name: "Library",
    path: "/student/library",
    icon: BookOpen,
  },
  {
  name: "Fee",
  path: "/student/fee",
  icon: CreditCard,
},
];

const assignments = [
  {
    subject: "Mathematics",
    title: "Algebra & Linear Equations",
    due: "Sep 12",
    status: "Pending",
  },
  {
    subject: "Science",
    title: "Environmental Science Report",
    due: "Sep 14",
    status: "Completed",
  },
  {
    subject: "Programming",
    title: "React Component Project",
    due: "Sep 16",
    status: "Pending",
  },
];

const jobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Tech Solutions Nepal",
    location: "Kathmandu",
  },
  {
    id: 2,
    title: "UI/UX Design Intern",
    company: "Creative Labs",
    location: "Remote",
  },
  {
    id: 3,
    title: "Junior React Developer",
    company: "Digital Works",
    location: "Lalitpur",
  },
];

function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-300" />
      </div>

      <p className="mt-5 text-xs text-slate-500">{title}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function Status({ value }) {
  if (value === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function StudentDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-950 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div>
            <h1 className="font-serif text-xl font-bold text-white">
              Smart LMS
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Student Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Main Menu
          </p>

          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-amber-500 text-slate-950"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="my-7 border-t border-slate-800" />

          <NavLink
            to="/student/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden md:block">
              <p className="text-xs text-slate-400">Student Portal</p>

              <p className="text-sm font-semibold text-slate-900">
                Academic Dashboard
              </p>
            </div>

            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-xl p-2.5 hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-amber-400">
                S
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold">Student</p>

                <p className="text-xs text-slate-400">STU-2049</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet context={{ assignments, jobs }} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* Dashboard Home */
export function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-9">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Student Dashboard
          </p>

          <h2 className="font-serif text-3xl font-medium sm:text-4xl">
            Good morning, Student 👋
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Stay on top of your coursework, attendance, and career
            opportunities from one place.
          </p>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={BookOpen}
          title="Enrolled Courses"
          value="06"
          description="Active courses"
        />

        <StatCard
          icon={CalendarCheck}
          title="Attendance"
          value="92%"
          description="Excellent attendance"
        />

        <StatCard
          icon={Briefcase}
          title="Available Jobs"
          value="12"
          description="New opportunities"
        />
      </section>

      {/* Assignments */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="font-semibold text-slate-900">
              Recent Assignments
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Your latest academic tasks
            </p>
          </div>

          <button
            onClick={() => navigate("/student/assignments")}
            className="text-xs font-semibold text-amber-700"
          >
            View all
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {assignments.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <ClipboardList className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.subject}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-xs text-slate-500">
                  Due {item.due}
                </span>

                <Status value={item.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Jobs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Recommended Jobs
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Opportunities matching your profile
            </p>
          </div>

          <button
            onClick={() => navigate("/student/jobs")}
            className="text-xs font-semibold text-amber-700"
          >
            Browse all
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950">
                <Briefcase className="h-5 w-5 text-amber-400" />
              </div>

              <h4 className="mt-5 font-semibold text-slate-900">
                {job.title}
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                {job.company}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                📍 {job.location}
              </p>

              <button
                onClick={() => navigate(`/student/jobs/${job.id}`)}
                className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold transition hover:bg-amber-50"
              >
                View details
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}