import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MapPin,
  Briefcase,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Plus,
  Book,
  FilePen,
  History,
  Navigation,
  CalendarClock,
  ClipboardCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

// =====================================================
// NAVIGATION
// =====================================================

const navigation = [
  {
    name: "Dashboard",
    path: "/teacher",
    icon: LayoutDashboard,
    end: true,
  },

  {
    name: "Students",
    path: "/teacher/students",
    icon: Users,
  },

  {
    name: "Assignments",
    path: "/teacher/assignments",
    icon: Book,
  },

  {
    name: "Attendance",
    path: "/teacher/attendance",
    icon: FilePen,
  },

  {
    name: "Vacancies",
    path: "/teacher/vacancies",
    icon: Briefcase,
  },

  {
    name: "Applications",
    path: "/teacher/applications",
    icon: FileText,
  },

  {
    name: "Notices",
    path: "/teacher/notices",
    icon: Bell,
  },
];

// =====================================================
// HOME VISIT NAVIGATION
// =====================================================

const homeVisitNavigation = [
  {
    name: "Student Location",
    path: "/teacher/visits/location",
    icon: Navigation,
  },

  {
    name: "Upcoming Visits",
    path: "/teacher/visits/upcoming",
    icon: CalendarClock,
  },

  {
    name: "Active Visit",
    path: "/teacher/visits/active",
    icon: ClipboardCheck,
  },

  {
    name: "Visit History",
    path: "/teacher/visits/history",
    icon: History,
  },
];

// =====================================================
// TEACHER DASHBOARD
// =====================================================

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [homeVisitOpen, setHomeVisitOpen] =
    useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* LOGO */}

        <div className="flex h-20 items-center justify-between border-b px-6">

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              Smart<span className="text-amber-500">.</span>
            </h1>

            <p className="text-xs text-slate-400">
              Teacher Portal
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >

                <Icon className="h-5 w-5" />

                {item.name}

              </NavLink>
            );
          })}

          {/* =================================================
              HOME VISITS
          ================================================= */}

          <div className="pt-2">

            <button
              type="button"
              onClick={() =>
                setHomeVisitOpen(
                  !homeVisitOpen
                )
              }
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >

              <div className="flex items-center gap-3">

                <MapPin className="h-5 w-5" />

                Home Visits

              </div>

              <span
                className={`text-xs transition-transform ${
                  homeVisitOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                ▼
              </span>

            </button>

            {homeVisitOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">

                {homeVisitNavigation.map(
                  (item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() =>
                          setSidebarOpen(false)
                        }
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                            isActive
                              ? "bg-emerald-50 font-semibold text-emerald-700"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }`
                        }
                      >

                        <Icon className="h-4 w-4" />

                        {item.name}

                      </NavLink>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </nav>

        {/* =================================================
            USER
        ================================================= */}

        <div className="border-t p-4">

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">

              {user?.username
                ?.charAt(0)
                .toUpperCase() || "T"}

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold">

                {user?.username ||
                  "Teacher"}

              </p>

              <p className="text-xs text-slate-400">
                Teacher
              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-500"
            >

              <LogOut className="h-4 w-4" />

            </button>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="lg:pl-72">

        {/* NAVBAR */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-white/90 px-4 backdrop-blur sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-xl p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>

              <p className="text-xs text-slate-400">
                Teacher Portal
              </p>

              <h2 className="font-bold text-slate-900">
                Academic Management
              </h2>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/teacher/notices")
            }
            className="rounded-xl p-2 hover:bg-slate-100"
          >

            <Bell className="h-5 w-5 text-slate-500" />

          </button>

        </header>

        {/* CONTENT */}

        <main className="p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

// =====================================================
// TEACHER HOME
// =====================================================

export function TeacherHome() {
  const navigate = useNavigate();

  const [visitStats, setVisitStats] =
    useState({
      total: 0,
      pending: 0,
      completed: 0,
    });

  const [loadingVisits, setLoadingVisits] =
    useState(true);

  const teacherId = "teacher1";

  // =====================================================
  // LOAD HOME VISIT STATS
  // =====================================================

  const loadVisitStats = async () => {
    try {
      setLoadingVisits(true);

      const response = await api.get(
        `/home-visits?teacherId=${teacherId}`
      );

      const visits =
        Array.isArray(response.data)
          ? response.data
          : response.data.visits || [];

      const pending = visits.filter(
        (visit) =>
          visit.status === "scheduled" ||
          visit.status === "started"
      ).length;

      const completed = visits.filter(
        (visit) =>
          visit.status === "completed"
      ).length;

      setVisitStats({
        total: visits.length,
        pending,
        completed,
      });
    } catch (error) {
      console.error(
        "Failed to load visit statistics:",
        error
      );

      setVisitStats({
        total: 0,
        pending: 0,
        completed: 0,
      });
    } finally {
      setLoadingVisits(false);
    }
  };

  useEffect(() => {
    loadVisitStats();
  }, []);

  // =====================================================
  // STATS
  // =====================================================

  const stats = [
    {
      title: "My Students",
      value: "42",
      description: "Students assigned",
      icon: Users,
    },

    {
      title: "Attendance",
      value: "90.5%",
      description: "Today's attendance",
      icon: CalendarCheck,
    },

    {
      title: "Home Visits",
      value: loadingVisits
        ? "..."
        : visitStats.total,
      description: loadingVisits
        ? "Loading visits..."
        : `${visitStats.pending} pending visits`,
      icon: MapPin,
    },

    {
      title: "Vacancies",
      value: "6",
      description: "2 posted by you",
      icon: Briefcase,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-sm font-medium text-amber-400">
            Teacher Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome back, Teacher
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Manage students, attendance,
            home visits and career
            opportunities from one dashboard.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/teacher/vacancies/create"
            )
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
        >

          <Plus className="h-4 w-4" />

          Post Vacancy

        </button>

      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">

                  <Icon className="h-5 w-5 text-amber-600" />

                </div>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                {stat.description}
              </p>

            </div>
          );
        })}

      </section>

      {/* =================================================
          HOME VISIT SUMMARY
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Home Visit Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage student locations and
              home visits.
            </p>

          </div>

          <MapPin className="h-6 w-6 text-emerald-600" />

        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          <VisitStat
            title="Total Visits"
            value={
              loadingVisits
                ? "..."
                : visitStats.total
            }
            onClick={() =>
              navigate("/teacher/visits/history")
            }
          />

          <VisitStat
            title="Pending Visits"
            value={
              loadingVisits
                ? "..."
                : visitStats.pending
            }
            onClick={() =>
              navigate("/teacher/visits/upcoming")
            }
          />

          <VisitStat
            title="Completed Visits"
            value={
              loadingVisits
                ? "..."
                : visitStats.completed
            }
            onClick={() =>
              navigate("/teacher/visits/history")
            }
          />

        </div>

      </section>

      {/* =================================================
          MANAGEMENT CARDS
      ================================================= */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <DashboardCard
          icon={Users}
          title="Manage Students"
          description="View student records and academic information."
          onClick={() =>
            navigate("/teacher/students")
          }
        />

        <DashboardCard
          icon={CalendarCheck}
          title="Attendance"
          description="Record and manage student attendance."
          onClick={() =>
            navigate("/teacher/attendance")
          }
        />

        <DashboardCard
          icon={MapPin}
          title="Home Visits"
          description="Manage student locations, upcoming visits, active visits and visit history."
          onClick={() =>
            navigate("/teacher/visits/upcoming")
          }
        />

        <DashboardCard
          icon={Briefcase}
          title="Manage Vacancies"
          description="Create and manage jobs and internships."
          onClick={() =>
            navigate("/teacher/vacancies")
          }
        />

        <DashboardCard
          icon={FileText}
          title="Applications"
          description="Review applications submitted by students."
          onClick={() =>
            navigate("/teacher/applications")
          }
        />

        <DashboardCard
          icon={Bell}
          title="Notices"
          description="Create and manage student notices."
          onClick={() =>
            navigate("/teacher/notices")
          }
        />

      </section>

    </div>
  );
}

// =====================================================
// VISIT STAT
// =====================================================

function VisitStat({
  title,
  value,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
    >

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-emerald-600">
        View →
      </p>

    </button>
  );
}

// =====================================================
// DASHBOARD CARD
// =====================================================

function DashboardCard({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">

        <Icon className="h-5 w-5 text-slate-700" />

      </div>

      <h3 className="mt-5 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </button>
  );
}