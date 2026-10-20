
import { Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MapPin,
  Briefcase,
  FileText,
  Bell,
  Book,
  FilePen,
  History,
  Navigation,
  CalendarClock,
  ClipboardCheck,
} from "lucide-react";

import {
  Donut,
  Bars,
  StackedBars,
  PALETTE,
} from "../../components/charts";
import PortalShell from "../../components/PortalShell";
import {
  Panel,
  StatCard,
  Legend,
  QuickAction,
  ChartSkeleton,
  EmptyChart,
} from "../../components/dashboard/kit";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

// =====================================================
// MAIN NAVIGATION
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
  return (
    <PortalShell
      portal="Teacher Portal"
      navigation={navigation}
      groups={[
        {
          title: "Home Visits",
          icon: MapPin,
          items: homeVisitNavigation.map((item) => ({
            title: item.name,
            path: item.path,
            icon: item.icon,
          })),
        },
      ]}
    >
      <Outlet />
    </PortalShell>
  );
}

// =====================================================
// TEACHER HOME
// =====================================================

export function TeacherHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/dashboard")
      .then(({ data }) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load dashboard."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const board = dashboard?.stats;
  const charts = dashboard?.charts || {};
  const trend = charts.attendanceTrend || [];
  const status = charts.attendanceStatus;
  const classes = charts.classes || [];
  const visits = charts.visits;

  const visitStats = {
    total: board?.visitsTotal ?? 0,
    awaiting: board?.visitsPending ?? 0,
    open: board?.visitsOpen ?? 0,
    completed: board?.visitsCompleted ?? 0,
  };

  const trendSegments = trend.map((day) => ({
    label: day.label,
    segments: [
      { value: day.present, color: PALETTE.present },
      { value: day.late, color: PALETTE.late },
      { value: day.absent, color: PALETTE.absent },
    ],
  }));

  const classBars = classes.map((item, index) => ({
    label: item.label,
    value: item.rate,
    color: [PALETTE.lime, PALETTE.sky, PALETTE.teal][index % 3],
  }));

  const visitSegments = visits
    ? [
        { label: "Awaiting parent", value: visits.awaiting, color: PALETTE.late },
        { label: "Accepted", value: visits.scheduled, color: PALETTE.present },
        { label: "Under way", value: visits.started, color: PALETTE.sky },
        { label: "Completed", value: visits.completed, color: PALETTE.completed },
        { label: "Declined", value: visits.declined, color: PALETTE.absent },
        { label: "Cancelled", value: visits.cancelled, color: PALETTE.pending },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="qd-ink relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-7 text-white sm:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Teacher Dashboard
            </p>

            <h1 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">
              Welcome back, {dashboard?.name || user?.name || "Teacher"} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Manage students, attendance, home visits and career
              opportunities from one dashboard.
            </p>

            {(dashboard?.assignedClasses || []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {dashboard.assignedClasses.map((className) => (
                  <span
                    key={className}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur"
                  >
                    {className}
                  </span>
                ))}
              </div>
            )}
          </div>

          {status && (
            <div className="flex gap-3">
              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs text-slate-300">Attendance rate</p>
                <p className="mt-1 text-3xl font-bold">{status.rate}%</p>
                <p className="text-xs text-slate-400">last 14 days</p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs text-slate-300">Awaiting parent</p>
                <p className="mt-1 text-3xl font-bold">{visitStats.awaiting}</p>
                <p className="text-xs text-slate-400">to confirm</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/teacher/vacancies/create")}
            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            + Post Vacancy
          </button>

          <button
            type="button"
            onClick={() => navigate("/teacher/visits/upcoming")}
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Request Home Visit
          </button>

          <button
            type="button"
            onClick={() => navigate("/teacher/attendance")}
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Mark Attendance
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="qd-stagger grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="My Students"
          value={board ? board.students : "—"}
          hint="across your classes"
          accent="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={CalendarCheck}
          label="Attendance"
          value={board ? `${board.attendancePercent}%` : "—"}
          hint="marked today"
          accent="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={MapPin}
          label="Home Visits"
          value={board ? visitStats.total : "—"}
          hint={`${visitStats.awaiting} awaiting parent`}
          accent="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={Briefcase}
          label="Vacancies"
          value={board ? board.jobsTotal : "—"}
          hint={`${board?.jobsMine ?? 0} posted by you`}
          accent="from-teal-500 to-emerald-600"
        />
      </section>

      {/* =================================================
          ATTENDANCE ANALYTICS
      ================================================= */}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Attendance Trend"
          subtitle="Present / late / absent across all your students, last 14 days"
          className="lg:col-span-2"
          action={
            <Legend
              items={[
                { label: "Present", color: PALETTE.present },
                { label: "Late", color: PALETTE.late },
                { label: "Absent", color: PALETTE.absent },
              ]}
            />
          }
        >
          {loading ? (
            <ChartSkeleton />
          ) : trend.length ? (
            <StackedBars data={trendSegments} />
          ) : (
            <EmptyChart message="No attendance recorded yet." />
          )}
        </Panel>

        <Panel title="Attendance Breakdown" subtitle="Last 14 days">
          {status ? (
            <Donut
              centerValue={`${status.rate}%`}
              centerLabel="present"
              data={[
                { label: "Present", value: status.present, color: PALETTE.present },
                { label: "Late", value: status.late, color: PALETTE.late },
                { label: "Absent", value: status.absent, color: PALETTE.absent },
              ]}
            />
          ) : (
            <ChartSkeleton />
          )}
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Attendance Rate by Class"
          subtitle="Percentage present or late over 14 days"
        >
          {loading ? (
            <ChartSkeleton />
          ) : classBars.length ? (
            <Bars data={classBars} suffix="%" />
          ) : (
            <EmptyChart message="No classes assigned." />
          )}
        </Panel>

        <Panel
          title="Home Visit Pipeline"
          subtitle={`${visitStats.total} total visits`}
          className="lg:col-span-2"
        >
          {visits ? (
            <Donut
              size={180}
              centerValue={visitStats.total}
              centerLabel="visits"
              data={visitSegments}
              className="lg:justify-start"
            />
          ) : (
            <ChartSkeleton />
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <VisitStat
              title="Total Visits"
              value={loading ? "—" : visitStats.total}
              onClick={() => navigate("/teacher/visits/history")}
            />
            <VisitStat
              title="Awaiting Parent"
              value={loading ? "—" : visitStats.awaiting}
              onClick={() => navigate("/teacher/visits/upcoming")}
            />
            <VisitStat
              title="Accepted"
              value={loading ? "—" : visitStats.open}
              onClick={() => navigate("/teacher/visits/upcoming")}
            />
            <VisitStat
              title="Completed Visits"
              value={loading ? "—" : visitStats.completed}
              onClick={() => navigate("/teacher/visits/history")}
            />
          </div>
        </Panel>
      </section>

      {/* =================================================
          MANAGEMENT CARDS
      ================================================= */}

      <section>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900">Quick actions</h3>
          <p className="mt-1 text-xs text-slate-400">
            Jump straight into the tools you use most
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            icon={Users}
            title="Manage Students"
            description="View student records and academic information."
            onClick={() => navigate("/teacher/students")}
            accent="from-emerald-500 to-teal-500"
          />
          <QuickAction
            icon={FilePen}
            title="Attendance"
            description="Record and manage daily student attendance."
            onClick={() => navigate("/teacher/attendance")}
            accent="from-emerald-500 to-teal-500"
          />
          <QuickAction
            icon={MapPin}
            title="Home Visits"
            description="Manage locations, upcoming visits, active visits and history."
            onClick={() => navigate("/teacher/visits/upcoming")}
            accent="from-amber-500 to-orange-500"
          />
          <QuickAction
            icon={Briefcase}
            title="Manage Vacancies"
            description="Create and manage jobs and internships."
            onClick={() => navigate("/teacher/vacancies")}
            accent="from-teal-500 to-emerald-600"
          />
          <QuickAction
            icon={FileText}
            title="Applications"
            description="Review applications submitted by students."
            onClick={() => navigate("/teacher/applications")}
            accent="from-lime-500 to-emerald-500"
          />
          <QuickAction
            icon={Bell}
            title="Notices"
            description="Publish notices to your classes and students."
            onClick={() => navigate("/teacher/notices")}
            accent="from-emerald-500 to-teal-600"
          />
        </div>
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
      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
    >
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1.5 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        View →
      </p>
    </button>
  );
}
