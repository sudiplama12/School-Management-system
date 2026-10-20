import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";

import SchoolBrand from "./SchoolBrand";
import ThemeToggle from "./ThemeToggle";
import { NoticeBell } from "./NoticeAlerts";
import { useAuth } from "../context/AuthContext";

// One shell for all four role portals: the same emerald sidebar, the same amber
// active pill, the same header and the same entrance motion. A portal supplies
// only its navigation, its label and its page content.
//
//   navigation = [{ name, path, icon, end }]                    (flat list)
//   groups     = [{ title, icon, items: [{ title, path, icon }] }]  (collapsible)

const IDLE_LINK =
  "text-emerald-100/65 hover:bg-white/5 hover:text-white hover:translate-x-1";
const ACTIVE_LINK = "bg-amber-400 text-emerald-950 shadow-lg shadow-amber-500/20";

export default function PortalShell({
  portal,
  navigation = [],
  groups = [],
  actions,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  // A group opens itself when you land on one of its links, then stays where
  // the administrator left it.
  const owningGroup = useMemo(
    () =>
      groups.find((g) =>
        g.items.some(
          (item) =>
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`)
        )
      )?.title,
    [groups, location.pathname]
  );

  const [collapsed, setCollapsed] = useState(() => new Set());

  useEffect(() => {
    document.title = `${school?.shortName || school?.name || "Smart LMS"} · ${portal}`;
  }, [school, portal]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = (user?.name || user?.username || "S").trim().charAt(0).toUpperCase();

  const toggleGroup = (title) =>
    setCollapsed((current) => {
      const next = new Set(current);

      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }

      return next;
    });

  const sidebar = (
    <>
      <div className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-emerald-900/60 px-5">
        <SchoolBrand school={school} portal={portal} tone="dark" />

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="rounded-lg p-2 text-emerald-200/70 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="qd-scrollbar qd-stagger-side min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/70">
          Menu
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 ${
                  isActive ? ACTIVE_LINK : IDLE_LINK
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}

        {groups.map((group) => {
          const GroupIcon = group.icon;
          const open = !collapsed.has(group.title) || group.title === owningGroup;

          return (
            <div key={group.title} className="pt-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                aria-expanded={open}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition duration-200 ${
                  group.title === owningGroup
                    ? "bg-emerald-500/15 text-amber-300"
                    : "text-emerald-100/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                <GroupIcon size={19} />

                <span className="min-w-0 flex-1">{group.title}</span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <div className="qd-fade-in mt-1 space-y-1 border-l border-emerald-800/70 pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition duration-200 ${
                            isActive
                              ? "bg-amber-400/15 font-semibold text-amber-300"
                              : "text-emerald-100/55 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <ItemIcon size={17} />
                        {item.title}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-emerald-900/60 p-4">
        <div className="qd-slide-right flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-sm font-bold text-emerald-950">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || user?.username || "Signed in"}
            </p>

            <p className="truncate text-[11px] capitalize text-emerald-200/60">
              {user?.role || ""} · {school?.shortName || "School"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-emerald-200/70 transition duration-200 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="qd-ink fixed inset-0 z-40 bg-emerald-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`qd-ink fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-slate-950 transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebar}
      </aside>

      <div className="lg:pl-72">
        <header className="qd-fade-in sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-200 bg-card/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                {school?.name || "Smart LMS"}
              </p>

              <p className="truncate text-sm font-semibold text-slate-900">
                {portal}
              </p>
            </div>

            {actions}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <NoticeBell />
          </div>

          {/* Grows out from the middle once the school name is on screen. */}
          <span className="qd-line absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Keyed by path so every page entering the portal fades up together. */}
          <div key={location.pathname} className="qd-fade-up mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
