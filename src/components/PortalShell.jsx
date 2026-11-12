import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Move, Pin, X } from "lucide-react";
import { useMotionValue } from "motion/react";

import SchoolBrand from "./SchoolBrand";
import ThemeToggle from "./ThemeToggle";
import ThemeSettings from "./ThemeSettings";
import SideNav from "./SideNav";
import { AnimatePresence, Fade, Float } from "./Motion";
import { NoticeBell } from "./NoticeAlerts";
import { useAuth } from "../context/AuthContext";

// One shell for all four role portals: the same emerald sidebar, the same header,
// the same entrance motion. A portal supplies only its navigation, its label and
// its page content.
//
//   navigation = [{ name, path, icon, end }]                    (flat list)
//   groups     = [{ title, icon, items: [{ title, path, icon }] }]  (collapsible)
//
// The sidebar is a working surface on a desktop: drag its right edge to make it
// wider, drag its rows to reorder them (see SideNav), or lift the whole thing off
// the edge with the grip in its header and put it wherever you are working. All
// three are remembered for the signed-in account. On a phone none of this applies
// — there the menu is a drawer, and a drawer you can resize is just a drawer you
// cannot close.

const MIN_W = 13;
const MAX_W = 28;
const DEFAULT_W = 18;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);

    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota: the menu still works, it just forgets.
  }
};

export default function PortalShell({
  portal,
  navigation = [],
  groups = [],
  actions,
  sideDraggable = false,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Preferences are keyed by account and portal, so the administrator's layout
  // does not follow you into the portal you use for a different job.
  const sideKey = `${user?.username || "anon"}:${portal}`;

  const [width, setWidth] = useState(() => {
    if (!sideDraggable) return DEFAULT_W;

    const stored = Number(readStored(`lms.side.w.${sideKey}`, DEFAULT_W));

    return Number.isFinite(stored) ? clamp(stored, MIN_W, MAX_W) : DEFAULT_W;
  });
  const [floating, setFloating] = useState(
    () => sideDraggable && Boolean(readStored(`lms.side.float.${sideKey}`, false))
  );
  const [seed] = useState(() =>
    sideDraggable ? readStored(`lms.side.pos.${sideKey}`, { x: 0, y: 0 }) : { x: 0, y: 0 }
  );

  // A detached panel is a desktop idea, and a draggable menu is an admin's idea.
  // On a phone the menu is a drawer, and a drawer you can resize is just a drawer
  // you cannot close.
  const [wide, setWide] = useState(() => window.innerWidth >= 1024);
  const isFloating = sideDraggable && floating && wide;

  const x = useMotionValue(Number(seed.x) || 0);
  const y = useMotionValue(Number(seed.y) || 0);

  const asideRef = useRef(null);

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

  useEffect(() => {
    if (!sideDraggable) return;

    writeStored(`lms.side.w.${sideKey}`, width);
  }, [sideDraggable, sideKey, width]);

  useEffect(() => {
    if (!sideDraggable) return;

    writeStored(`lms.side.float.${sideKey}`, floating);
  }, [sideDraggable, sideKey, floating]);

  // Track the breakpoint, and keep a detached panel on screen when the window
  // shrinks under it.
  useEffect(() => {
    const onResize = () => {
      setWide(window.innerWidth >= 1024);

      const panel = asideRef.current?.getBoundingClientRect();
      if (!panel || !isFloating) return;

      x.set(clamp(x.get(), 0, Math.max(0, window.innerWidth - panel.width)));
      y.set(clamp(y.get(), 0, Math.max(0, window.innerHeight - panel.height)));
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [isFloating, x, y]);

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

  // Lifting off the edge starts from where the panel already is, so it reads as
  // the same object coming loose rather than a new one appearing.
  const detach = () => {
    const rect = asideRef.current?.getBoundingClientRect();

    if (rect) {
      x.set(rect.left);
      y.set(rect.top);
    }

    setFloating(true);
  };

  // Motion leaves the transform it wrote behind, so docking has to zero the
  // offset or the sidebar returns to the edge standing where you dropped it.
  const dock = () => {
    x.set(0);
    y.set(0);
    writeStored(`lms.side.pos.${sideKey}`, { x: 0, y: 0 });
    setFloating(false);
  };

  const dragEdge = (event) => {
    const strip = event.currentTarget;
    const { pointerId, clientX } = event;

    strip.setPointerCapture(pointerId);

    const start = { pointer: clientX, width };

    const move = (moveEvent) => {
      if (!moveEvent.buttons) return;

      setWidth(clamp(start.width + (moveEvent.clientX - start.pointer) / 16, MIN_W, MAX_W));
    };

    const stop = () => {
      if (strip.hasPointerCapture(pointerId)) strip.releasePointerCapture(pointerId);

      strip.removeEventListener("pointermove", move);
      strip.removeEventListener("pointerup", stop);
      strip.removeEventListener("pointercancel", stop);
    };

    strip.addEventListener("pointermove", move);
    strip.addEventListener("pointerup", stop);
    strip.addEventListener("pointercancel", stop);
  };

  const sidebar = (
    <>
      <div className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-emerald-900/60 px-5">
        <SchoolBrand school={school} portal={portal} tone="dark" />

        <div className="flex shrink-0 items-center gap-1">
          {/* Administrators only, and on a desktop only: the grip that takes the
              menu off the edge. */}
          {sideDraggable && (
            <button
              type="button"
              onClick={() => (isFloating ? dock() : detach())}
              aria-label={isFloating ? "Dock the menu" : "Float the menu"}
              aria-pressed={isFloating}
              title={isFloating ? "Dock the menu to the edge" : "Drag the menu anywhere"}
              className="hidden rounded-lg p-2 text-emerald-200/70 transition hover:bg-white/5 hover:text-white lg:inline-flex"
            >
              {isFloating ? <Pin size={17} /> : <Move size={17} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-emerald-200/70 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <SideNav
        draggable={sideDraggable}
        storageKey={sideKey}
        navigation={navigation}
        groups={groups}
        collapsed={collapsed}
        onToggleGroup={toggleGroup}
        owningGroup={owningGroup}
      />

      <div className="shrink-0 border-t border-emerald-900/60 p-4">
        <div className="qd-slide-right flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-sm font-bold text-emerald-950">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || user?.username || "Signed in"}
            </p>

            <p className="truncate text-[11px] capitalize text-emerald-200/80">
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

      {/* The grab line. Double-click puts the width back to the default. */}
      {sideDraggable && !isFloating && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the menu"
          title="Drag to resize · double-click to reset"
          onPointerDown={dragEdge}
          onDoubleClick={() => setWidth(DEFAULT_W)}
          className="group/edge absolute inset-y-0 right-0 z-10 hidden w-3 cursor-ew-resize touch-none lg:block"
        >
          <span className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-emerald-300/10 transition group-hover/edge:bg-amber-300/60" />
          <span className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/20 transition group-hover/edge:bg-amber-300/80" />
        </div>
      )}
    </>
  );

  return (
    <div
      className="qd-canvas min-h-screen bg-slate-50"
      style={{ "--side-w": `${width}rem` }}
    >
      <AnimatePresence>
        {mobileOpen && (
          <Fade
            onClick={() => setMobileOpen(false)}
            className="qd-ink fixed inset-0 z-40 bg-emerald-950/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Keyed by state, so docking hands the element back to CSS clean. The
          library writes an inline transform while dragging and does not remove it
          afterwards, and an inline `translate(0, 0)` beats the `-translate-x-full`
          the mobile drawer needs — the same class of collision that used to freeze
          the role selector on the sign-in card. */}
      <Float
        key={isFloating ? "side-float" : "side-dock"}
        as="aside"
        ref={asideRef}
        floating={isFloating}
        x={x}
        y={y}
        onDragEnd={(_, info) =>
          writeStored(`lms.side.pos.${sideKey}`, { x: info.offset.x, y: info.offset.y })
        }
        style={{ width: isFloating ? `${width}rem` : undefined }}
        className={`qd-ink qd-side fixed flex flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-slate-950 ${
          isFloating
            ? "left-0 top-0 z-50 h-[min(78vh,44rem)] rounded-2xl shadow-2xl shadow-emerald-950/60 ring-1 ring-emerald-900/70"
            : "inset-y-0 left-0 z-50 w-[86vw] max-w-72 transition-transform duration-300 ease-out lg:w-[var(--side-w)] lg:max-w-[28rem] " +
              (mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }`}
      >
        {/* The school scene, kept well below the menu so it never fogs it. */}
        <div aria-hidden="true" className="qd-art-wash absolute inset-0 -z-10" />

        {sidebar}
      </Float>

      <div className={isFloating ? "" : "lg:pl-[var(--side-w)]"}>
        <header className="qd-fade-in qd-bar sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-200 bg-card/85 px-4 backdrop-blur sm:px-6 lg:px-8">
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
            {/* Quick flip for the common case, full panel for the rest. */}
            <ThemeToggle className="hidden sm:inline-flex" />
            <ThemeSettings />

            <NoticeBell />
          </div>

          {/* Grows out from the middle once the school name is on screen. */}
          <span className="qd-line absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Keyed by path, so the page being left animates out *before* the
              one arriving takes its place instead of two layouts flashing on
              top of each other. The first render of a portal is not animated. */}
          <AnimatePresence mode="wait" initial={false}>
            <Fade key={location.pathname} className="mx-auto max-w-7xl">
              {children}
            </Fade>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
