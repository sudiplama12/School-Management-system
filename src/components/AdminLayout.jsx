import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserRound,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ChevronDown,
  Menu,
  X,
  ClipboardCheck,
  Library,
  BookMarked,
  RotateCcw,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const menuGroups = [
  {
    title: "Teacher Management",
    icon: Users,
    items: [
      { title: "Manage Teachers", path: "/admin/teachers", icon: Users },
      {
        title: "Teacher Attendance",
        path: "/admin/teacher-attendance",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Student Management",
    icon: GraduationCap,
    items: [
      {
        title: "Manage Students",
        path: "/admin/students",
        icon: GraduationCap,
      },
      {
        title: "Student Attendance",
        path: "/admin/attendance",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Library Management",
    icon: Library,
    items: [
      { title: "Manage Books", path: "/admin/library/books", icon: BookOpen },
      { title: "Issue Books", path: "/admin/library/issue", icon: BookMarked },
      { title: "Return Books", path: "/admin/library/return", icon: RotateCcw },
    ],
  },
  {
    title: "Users & Access",
    icon: ShieldCheck,
    items: [
      { title: "Manage Parents", path: "/admin/parents", icon: UserRound },
      { title: "Permissions", path: "/admin/permissions", icon: ShieldCheck },
      { title: "All Users", path: "/admin/users", icon: Users },
    ],
  },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(
    Object.fromEntries(menuGroups.map((group) => [group.title, true]))
  );

  const toggleGroup = (title) => {
    setExpandedGroups((previous) => ({
      ...previous,
      [title]: !previous[title],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600">
          <GraduationCap size={26} className="text-white" />
        </div>

        <div>
          <h1 className="text-base font-bold text-white">Smart School</h1>
          <p className="text-xs text-slate-400">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#475569_transparent]">
        <NavLink
          to="/admin"
          end
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        {menuGroups.map((group) => {
          const GroupIcon = group.icon;

          const isActiveGroup = group.items.some(
            (item) =>
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`)
          );

          const isExpanded = expandedGroups[group.title];

          return (
            <div key={group.title} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  isActiveGroup
                    ? "text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <GroupIcon size={19} />

                <span className="min-w-0 flex-1">{group.title}</span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="ml-5 space-y-1 border-l border-slate-700 pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                            isActive
                              ? "bg-emerald-600/20 font-semibold text-emerald-400"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <ItemIcon size={17} />
                        <span>{item.title}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-900 p-3">
          <p className="text-sm font-semibold text-white">
            {user?.username || "Admin"}
          </p>
          <p className="mt-1 text-xs capitalize text-slate-400">
            {user?.role || "admin"} panel
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-72 shrink-0 flex-col overflow-hidden bg-slate-950 md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-hidden bg-slate-950">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-6 z-10 rounded-lg p-2 text-slate-300 hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          >
            <Menu size={22} />
          </button>

          <h2 className="text-base font-semibold text-slate-800">
            Smart School Management System
          </h2>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;