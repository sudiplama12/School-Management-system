
import { Link } from "react-router-dom";
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
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

const dashboardStats = [
  {
    title: "Total Students",
    value: "1,248",
    description: "Registered students",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-700",
    link: "/admin/students",
  },
  {
    title: "Total Teachers",
    value: "64",
    description: "Active teachers",
    icon: Users,
    color: "bg-purple-100 text-purple-700",
    link: "/admin/teachers",
  },
  {
    title: "Today's Attendance",
    value: "94.5%",
    description: "Student attendance",
    icon: UserCheck,
    color: "bg-emerald-100 text-emerald-700",
    link: "/admin/attendance",
  },
  {
    title: "Pending Fees",
    value: "Rs. 85,000",
    description: "Fees to be collected",
    icon: Wallet,
    color: "bg-amber-100 text-amber-700",
    link: "/admin/fees",
  },
];

const quickActions = [
  {
    title: "Add Student",
    description: "Register a new student",
    icon: GraduationCap,
    link: "/admin/students",
  },
  {
    title: "Manage Teachers",
    description: "View and manage teachers",
    icon: Users,
    link: "/admin/teachers",
  },
  {
    title: "Mark Attendance",
    description: "Manage daily attendance",
    icon: CalendarCheck,
    link: "/admin/attendance",
  },
  {
    title: "Assignments",
    description: "Manage school assignments",
    icon: ClipboardList,
    link: "/admin/assignments",
  },
  {
    title: "Reports",
    description: "View school reports",
    icon: FileText,
    link: "/admin/reports",
  },
  {
    title: "Notices",
    description: "Publish school notices",
    icon: Bell,
    link: "/admin/notices",
  },
];

const recentActivities = [
  {
    title: "Student registration",
    description: "A new student was registered.",
    time: "Recently",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Attendance updated",
    description: "Daily attendance records were updated.",
    time: "Today",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Fee payment pending",
    description: "Some student fees need follow-up.",
    time: "Pending",
    icon: CircleAlert,
    color: "bg-amber-100 text-amber-700",
  },
];

function SectionHeading({ title, subtitle, action, to }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      {action && to && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <Link
      to={stat.link}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {stat.title}
          </p>

          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {stat.value}
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            {stat.description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        View details
        <ArrowRight
          size={14}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function QuickActionCard({ action }) {
  const Icon = action.icon;

  return (
    <Link
      to={action.link}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
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
        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
      />
    </Link>
  );
}

function AdminDashboard() {
  return (
    <div className="min-h-full space-y-8 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Smart School Management System
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of your school's activities and performance.
          </p>
        </div>

        <Link
          to="/admin/reports"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <FileText size={17} />
          View Reports
        </Link>
      </section>

      {/* Statistics */}
      <section>
        <SectionHeading
          title="School Overview"
          subtitle="A quick summary of your school"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>
      </section>

      {/* Main dashboard content */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Quick actions */}
        <div className="xl:col-span-2">
          <SectionHeading
            title="Quick Actions"
            subtitle="Access commonly used school management features"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.title}
                action={action}
              />
            ))}
          </div>
        </div>

        {/* Recent activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading
            title="Recent Activity"
            subtitle="A summary of recent school events"
            action="View all"
            to="/admin/notifications"
          />

          <div className="space-y-5">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.title}
                  className="flex gap-3"
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

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {activity.description}
                    </p>

                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <TrendingUp size={18} />
              <span className="text-sm font-semibold">
                School at a glance
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Use the dashboard shortcuts to manage students,
              teachers, attendance, fees, and school notices.
            </p>
          </div>
        </div>
      </section>

      {/* Attendance summary */}
      <section>
        <SectionHeading
          title="Attendance Summary"
          subtitle="Illustrative attendance overview"
          action="Manage attendance"
          to="/admin/attendance"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Present
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              1,180
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Students marked present
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Absent
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              42
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Students marked absent
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              On Leave / Unmarked
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              26
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Confirm these records in attendance
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
        Smart School Management System
      </footer>
    </div>
  );
}

export default AdminDashboard;
