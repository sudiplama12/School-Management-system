
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  GraduationCap,
  UserCheck,
  Wallet,
  CalendarCheck,
  ClipboardList,
  FileText,
  Bell,
  ArrowRight,
  TrendingUp,
  Clock,
  CircleAlert,
  MessageSquareWarning,
  BookOpen,
  Briefcase,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import {
  Donut,
  Bars,
  RateLine,
  StackedBars,
  PALETTE,
} from "../../components/charts";
import {
  Panel,
  StatCard as MetricCard,
  Legend,
  ProgressBar,
  ChartSkeleton,
  EmptyChart,
} from "../../components/dashboard/kit";

const formatActivityDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// The activity feed from the API carries no icon/colour, so a presentation
// style is chosen from the known activity titles, falling back to a default.
const activityStyle = (title = "") => {
  const normalized = title.toLowerCase();

  if (normalized.includes("registration")) {
    return { icon: GraduationCap, color: "bg-blue-100 text-blue-700 dark:text-blue-300" };
  }

  if (normalized.includes("notice")) {
    return { icon: Bell, color: "bg-emerald-100 text-emerald-700 dark:text-emerald-300" };
  }

  if (normalized.includes("vacancy")) {
    return { icon: FileText, color: "bg-amber-100 text-amber-700 dark:text-amber-300" };
  }

  if (normalized.includes("fee")) {
    return { icon: CircleAlert, color: "bg-amber-100 text-amber-700 dark:text-amber-300" };
  }

  if (normalized.includes("visit")) {
    return { icon: CalendarCheck, color: "bg-emerald-100 text-emerald-700 dark:text-emerald-300" };
  }

  if (normalized.includes("book")) {
    return { icon: ClipboardList, color: "bg-amber-100 text-amber-700 dark:text-amber-300" };
  }

  return { icon: Clock, color: "bg-slate-100 text-slate-600" };
};

const quickActions = [
  {
    title: "Add Student",
    description: "Register a new student",
    icon: GraduationCap,
    link: "/admin/students",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Manage Teachers",
    description: "View and manage teachers",
    icon: Users,
    link: "/admin/teachers",
    accent: "from-lime-500 to-emerald-500",
  },
  {
    title: "Manage Parents",
    description: "Linked parent accounts",
    icon: UserCheck,
    link: "/admin/parents",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    title: "Mark Attendance",
    description: "Manage daily student attendance",
    icon: CalendarCheck,
    link: "/admin/attendance",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Teacher Attendance",
    description: "Staff attendance register",
    icon: ClipboardList,
    link: "/admin/teacher-attendance",
    accent: "from-teal-500 to-emerald-600",
  },
  {
    title: "Library Books",
    description: "Manage the book catalogue",
    icon: BookOpen,
    link: "/admin/library/books",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Issue Books",
    description: "Issue books to students",
    icon: Briefcase,
    link: "/admin/library/issue",
    accent: "from-rose-500 to-red-600",
  },
  {
    title: "All Users",
    description: "Accounts and access",
    icon: UserRound,
    link: "/admin/users",
    accent: "from-teal-500 to-amber-500",
  },
  {
    title: "Permissions",
    description: "Role capabilities",
    icon: ShieldCheck,
    link: "/admin/permissions",
    accent: "from-teal-600 to-emerald-700",
  },
];

function SectionHeading({ title, subtitle, action, to }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {subtitle}
        </p>
      </div>

      {action && to && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function LinkedStat({ icon, label, value, hint, accent, link }) {
  return (
    <Link
      to={link}
      className="block transition hover:-translate-y-0.5"
    >
      <MetricCard
        icon={icon}
        label={label}
        value={value}
        hint={hint}
        accent={accent}
      />
    </Link>
  );
}

function QuickActionCard({ action }) {
  const Icon = action.icon;

  return (
    <Link
      to={action.link}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} text-white`}
      >
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-800">
          {action.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {action.description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 dark:hover:text-emerald-400"
      />
    </Link>
  );
}

function TodayTile({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const { school } = useAuth();

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

  const stats = dashboard?.stats;
  const attendance = dashboard?.attendance;
  const charts = dashboard?.charts || {};
  const trend = charts.attendanceTrend || [];
  const status = charts.attendanceStatus;
  const enrollments = charts.enrollments || [];
  const roles = charts.roles;
  const fees = charts.fees;

  const feeTotal = fees ? fees.paid + fees.outstanding : 0;

  const trendSegments = trend.map((day) => ({
    label: day.label,
    segments: [
      { value: day.present, color: PALETTE.present },
      { value: day.late, color: PALETTE.late },
      { value: day.absent, color: PALETTE.absent },
    ],
  }));

  const rateSeries = trend.map((day) => {
    const marked = day.present + day.late + day.absent;

    return {
      label: day.label,
      value: marked ? Math.round(((day.present + day.late) / marked) * 100) : 0,
    };
  });

  const enrollmentBars = enrollments.map((item, index) => ({
    label: item.label,
    value: item.value,
    color: [PALETTE.lime, PALETTE.sky, PALETTE.teal, PALETTE.present][index % 4],
  }));

  const recentActivities = (dashboard?.activity || []).map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    time: formatActivityDate(activity.createdAt),
    ...activityStyle(activity.title),
  }));

  return (
    <div className="min-h-full space-y-6">
      {/* Page heading */}
      <section className="qd-ink relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-7 text-white sm:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              {school?.name || "Smart School Management System"}
            </p>

            <h1 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Live overview of enrolment, attendance, fees and school activity.
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

        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            <GraduationCap size={17} />
            Manage Students
          </Link>

          <Link
            to="/admin/attendance"
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Mark Attendance
          </Link>

          <Link
            to="/admin/users"
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            All Users
          </Link>
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Statistics */}
      <section className="qd-stagger grid grid-cols-2 gap-4 xl:grid-cols-3">
        <LinkedStat
          icon={GraduationCap}
          label="Total Students"
          value={stats ? stats.totalStudents : "—"}
          hint="registered and active"
          accent="from-emerald-500 to-teal-500"
          link="/admin/students"
        />
        <LinkedStat
          icon={Users}
          label="Total Teachers"
          value={stats ? stats.totalTeachers : "—"}
          hint="active staff"
          accent="from-lime-500 to-emerald-500"
          link="/admin/teachers"
        />
        <LinkedStat
          icon={UserCheck}
          label="Today's Attendance"
          value={stats ? `${stats.attendancePercent}%` : "—"}
          hint={attendance ? `${attendance.total} students on roll` : "—"}
          accent="from-emerald-500 to-teal-500"
          link="/admin/attendance"
        />
        <LinkedStat
          icon={Wallet}
          label="Pending Fees"
          value={stats ? `Rs. ${Number(stats.pendingFees).toLocaleString()}` : "—"}
          hint="to be collected"
          accent="from-amber-500 to-orange-500"
          link="/admin/fees"
        />
        <MetricCard
          icon={MessageSquareWarning}
          label="Open Queries"
          value={stats ? stats.pendingQueries : "—"}
          hint="awaiting response"
          accent="from-teal-500 to-emerald-600"
        />
        <LinkedStat
          icon={TrendingUp}
          label="14-Day Attendance"
          value={status ? `${status.rate}%` : "—"}
          hint={status ? `${status.present + status.late} of ${status.present + status.absent + status.late} marked present` : "—"}
          accent="from-emerald-500 to-teal-600"
          link="/admin/attendance"
        />
      </section>

      {/* Attendance analytics */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Attendance Trend"
          subtitle="School-wide present / late / absent, last 14 days"
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
          title="Daily Attendance Rate"
          subtitle="Percentage of marked students who attended"
          className="lg:col-span-2"
        >
          {loading ? (
            <ChartSkeleton />
          ) : rateSeries.length ? (
            <RateLine data={rateSeries} color={PALETTE.sky} />
          ) : (
            <EmptyChart message="No attendance recorded yet." />
          )}
        </Panel>

        <Panel title="Today at a Glance" subtitle="Live attendance counts">
          {attendance ? (
            <div className="grid grid-cols-2 gap-3">
              <TodayTile
                label="Present"
                value={attendance.present}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <TodayTile
                label="Absent"
                value={attendance.absent}
                color="text-rose-600 dark:text-rose-400"
              />
              <TodayTile
                label="Late"
                value={attendance.late ?? 0}
                color="text-amber-600 dark:text-amber-400"
              />
              <TodayTile
                label="Unmarked"
                value={attendance.unmarked}
                color="text-slate-600"
              />
            </div>
          ) : (
            <ChartSkeleton />
          )}

          <Link
            to="/admin/attendance"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            Mark today's attendance
            <ArrowRight size={14} />
          </Link>
        </Panel>
      </section>

      {/* Enrolment + people */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Students per Class"
          subtitle="Enrolment distribution"
          className="lg:col-span-2"
        >
          {loading ? (
            <ChartSkeleton />
          ) : enrollmentBars.length ? (
            <Bars data={enrollmentBars} />
          ) : (
            <EmptyChart message="No classes with students." />
          )}
        </Panel>

        <Panel title="Role Distribution" subtitle="Accounts by type">
          {roles ? (
            <Donut
              centerValue={roles.students + roles.teachers + roles.parents + roles.admins}
              centerLabel="accounts"
              data={[
                { label: "Students", value: roles.students, color: PALETTE.completed },
                { label: "Teachers", value: roles.teachers, color: PALETTE.lime },
                { label: "Parents", value: roles.parents, color: PALETTE.sky },
                { label: "Admins", value: roles.admins, color: PALETTE.late },
              ]}
            />
          ) : (
            <ChartSkeleton />
          )}
        </Panel>
      </section>

      {/* Fees + activity */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Fee Collection" subtitle="Paid vs outstanding">
          {fees && feeTotal > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Collected</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  Rs. {fees.paid.toLocaleString()}
                </p>
              </div>

              <ProgressBar value={(fees.paid / feeTotal) * 100} color={PALETTE.paid} />

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{Math.round((fees.paid / feeTotal) * 100)}% cleared</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Rs. {fees.outstanding.toLocaleString()} due
                </span>
              </div>

              <Link
                to="/admin/fees"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Open fee management
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <EmptyChart message="No fee records." />
          )}
        </Panel>

        <Panel
          title="Recent Activity"
          subtitle="Newest events across every module"
          className="lg:col-span-2"
          action={
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              Manage accounts
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {loading ? (
              <p className="text-sm text-slate-500">Loading activity…</p>
            ) : error ? (
              <p className="text-sm text-slate-500">
                Could not load recent activity.
              </p>
            ) : recentActivities.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity yet.</p>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex gap-3 rounded-2xl border border-slate-100 p-3"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.color}`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">
                        {activity.title}
                      </h3>

                      <p className="mt-1 truncate text-xs leading-5 text-slate-500">
                        {activity.description}
                      </p>

                      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </section>

      {/* Quick actions */}
      <section>
        <SectionHeading
          title="Quick Actions"
          subtitle="Access commonly used school management features"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} action={action} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-600">
        {school?.name || "Smart LMS"} · {school?.session ? `Session ${school.session}` : "School portal"}
      </footer>
    </div>
  );
}

export default AdminDashboard;
