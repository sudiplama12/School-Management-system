
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  User,
  MapPin,
  CalendarCheck,
  ClipboardList,
  Bell,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
} from "lucide-react";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/parent",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "My Child",
    path: "/parent/student",
    icon: User,
  },
  {
    name: "Location Requests",
    path: "/parent/location-request",
    icon: MapPin,
  },
  {
    name: "Visit History",
    path: "/parent/visits",
    icon: FileText,
  },
  {
    name: "Attendance",
    path: "/parent/attendance",
    icon: CalendarCheck,
  },
  {
    name: "Assignments",
    path: "/parent/assignments",
    icon: ClipboardList,
  },
  {
    name: "Notices",
    path: "/parent/notices",
    icon: Bell,
  },
  {
    name: "Fees",
    path: "/parent/fees",
    icon: Wallet,
  },
  {
    name: "Queries",
    path: "/parent/queries",
    icon: User,
  },
  {
    name: "Settings",
    path: "/parent/settings",
    icon: Settings,
  },
];

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getInitial = () => {
    const username = user?.username;

    if (!username) {
      return "P";
    }

    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Smart<span className="text-emerald-500">.</span>
            </h1>

            <p className="text-xs text-slate-400">
              Parent Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              {getInitial()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.username || "Parent"}
              </p>

              <p className="text-xs text-slate-400">
                Parent
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN AREA
      ================================================= */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-xs text-slate-400">
                Parent Portal
              </p>

              <h2 className="font-bold text-slate-900">
                Student Management
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/parent/notices")}
            aria-label="Open notices"
            className="rounded-xl p-2 transition hover:bg-slate-100"
          >
            <Bell className="h-5 w-5 text-slate-500" />
          </button>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
