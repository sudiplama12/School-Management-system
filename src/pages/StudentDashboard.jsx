import { useEffect, useState } from "react";
import {
  Outlet,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  GraduationCap,
  MapPin,
  Settings,
  Bell,
  Newspaper,
  Search,
  BookOpen,
  CreditCard,
  CalendarCheck,
  ClipboardList,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import {
  Donut,
  StackedBars,
  PALETTE,
} from "../components/charts";
import PortalShell from "../components/PortalShell";
import {
  Panel,
  StatCard,
  Legend,
  ProgressBar,
  ChartSkeleton,
  EmptyChart,
} from "../components/dashboard/kit";

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
    name: "Assignments",
    path: "/student/assignments",
    icon: CreditCard,
  },
  {
    name: "Notices",
    path: "/student/notices",
    icon: Bell,
  },
  {
    name: "Blog",
    path: "/student/blog",
    icon: Newspaper,
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
    name: "Result",
    path: "/student/results",
    icon: GraduationCap,
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
  {
    name: "Settings",
    path: "/student/settings",
    icon: Settings,
  },
];

const formatDueDate = (date) => {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

function Status({ value }) {
  if (value === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function StudentDashboard() {
  const { studentId } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const assignments = dashboard?.assignments || [];
  const jobs = dashboard?.jobs || [];

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

  return (
    <PortalShell
      portal="Student Portal"
      navigation={navigation}
      actions={
        <label className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            aria-label="Search the portal"
            placeholder="Search…"
            className="h-10 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />
        </label>
      }
    >
      <Outlet
        context={{
          assignments,
          jobs,
          stats: dashboard?.stats,
          charts: dashboard?.charts,
          dashboard,
          loading,
          error,
          studentId,
        }}
      />
    </PortalShell>
  );
}

/* Dashboard Home */
export function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assignments, jobs, stats, charts, loading, error } =
    useOutletContext();

  const trend = charts?.attendanceTrend || [];
  const status = charts?.attendanceStatus;
  const fees = charts?.fees;
  const assignmentSplit = charts?.assignments;

  const attendanceSegments = trend.map((day) => ({
    label: day.label,
    segments: [
      { value: day.present, color: PALETTE.present },
      { value: day.late, color: PALETTE.late },
      { value: day.absent, color: PALETTE.absent },
    ],
  }));

  const feeTotal = fees ? fees.paid + fees.outstanding : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="qd-ink relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-7 text-white sm:p-9">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
              Student Dashboard
            </p>
            <h2 className="font-serif text-3xl font-medium sm:text-4xl">
              Hi {user?.name || "there"} 👋
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
              Track your attendance, coursework and career opportunities — all
              in one place.
            </p>
          </div>

          {status && (
            <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
              <p className="text-xs text-slate-300">Attendance rate</p>
              <p className="mt-1 text-4xl font-bold">{status.rate}%</p>
              <p className="text-xs text-slate-400">last 14 days</p>
            </div>
          )}
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* KPI row */}
      <section className="qd-stagger grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Attendance"
          value={stats ? `${stats.attendancePercent}%` : "—"}
          hint="today"
          accent="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={stats ? stats.enrolledCourses : "—"}
          hint="this term"
          accent="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={Wallet}
          label="Fees Outstanding"
          value={
            fees ? `Rs. ${fees.outstanding.toLocaleString()}` : "—"
          }
          hint={fees && fees.outstanding === 0 ? "All paid" : "pending"}
          accent="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={Briefcase}
          label="Available Jobs"
          value={stats ? stats.availableJobs : "—"}
          hint="openings"
          accent="from-teal-500 to-emerald-600"
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Attendance Trend"
          subtitle="Present / late / absent over 14 days"
          className="lg:col-span-2"
          action={<Legend items={[
            { label: "Present", color: PALETTE.present },
            { label: "Late", color: PALETTE.late },
            { label: "Absent", color: PALETTE.absent },
          ]} />}
        >
          {loading ? (
            <ChartSkeleton />
          ) : trend.length ? (
            <StackedBars data={attendanceSegments} />
          ) : (
            <EmptyChart />
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
        <Panel title="Assignment Completion" subtitle="Submitted vs pending">
          {assignmentSplit ? (
            <div className="space-y-4">
              <Donut
                centerValue={assignmentSplit.completed + assignmentSplit.pending}
                centerLabel="total"
                data={[
                  { label: "Completed", value: assignmentSplit.completed, color: PALETTE.completed },
                  { label: "Pending", value: assignmentSplit.pending, color: PALETTE.pending },
                ]}
              />
            </div>
          ) : (
            <ChartSkeleton />
          )}
        </Panel>

        <Panel title="Fees" subtitle="Paid vs outstanding" className="lg:col-span-2">
          {fees && feeTotal > 0 ? (
            <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Paid</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {fees.paid.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Outstanding</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    Rs. {fees.outstanding.toLocaleString()}
                  </p>
                </div>
              </div>

              <ProgressBar
                value={(fees.paid / feeTotal) * 100}
                color={PALETTE.paid}
              />
              <p className="text-xs text-slate-400">
                {Math.round((fees.paid / feeTotal) * 100)}% of total fees cleared
              </p>
            </div>
          ) : (
            <EmptyChart />
          )}
        </Panel>
      </section>

      {/* Recent assignments */}
      <Panel
        title="Recent Assignments"
        subtitle="Your latest academic tasks"
        action={
          <button
            onClick={() => navigate("/student/assignments")}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            View all
          </button>
        }
      >
        <div className="divide-y divide-slate-100">
          {loading ? (
            <p className="py-4 text-sm text-slate-500">Loading assignments…</p>
          ) : assignments.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No assignments yet.</p>
          ) : (
            assignments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400">{item.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <span className="text-xs text-slate-500">
                    Due {formatDueDate(item.dueDate)}
                  </span>
                  <Status value={item.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Recommended jobs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Recommended Jobs</h3>
            <p className="mt-1 text-xs text-slate-400">
              Opportunities matching your profile
            </p>
          </div>
          <button
            onClick={() => navigate("/student/jobs")}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            Browse all
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length === 0 && !loading ? (
            <p className="text-sm text-slate-500">No jobs available right now.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200/70 bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-emerald-800">
                  <Briefcase className="h-5 w-5 text-amber-400" />
                </div>
                <h4 className="mt-4 font-semibold text-slate-900">{job.title}</h4>
                <p className="mt-1 text-xs text-slate-500">{job.company}</p>
                <p className="mt-2 text-xs text-slate-400">📍 {job.location}</p>
                <button
                  onClick={() => navigate(`/student/jobs/${job.id}`)}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-emerald-50"
                >
                  View details
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
