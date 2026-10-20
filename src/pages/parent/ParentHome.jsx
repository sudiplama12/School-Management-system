import { useEffect, useState } from "react";
import {
  User,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  Bell,
  Wallet,
  ArrowRight,
  Navigation,
  History,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Donut,
  RateLine,
  StackedBars,
  PALETTE,
} from "../../components/charts";
import {
  Panel,
  StatCard,
  Legend,
  ProgressBar,
  QuickAction,
  ChartSkeleton,
  EmptyChart,
} from "../../components/dashboard/kit";

export default function ParentHome() {
  const navigate = useNavigate();

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

  const child = dashboard?.child || null;
  const stats = dashboard?.stats || null;
  const charts = dashboard?.charts || {};
  const trend = charts.attendanceTrend || [];
  const status = charts.attendanceStatus;
  const fees = charts.fees;
  const assignments = charts.assignments;
  const visits = charts.visits;

  const feeTotal = fees ? fees.paid + fees.outstanding : 0;

  const trendSegments = trend.map((day) => ({
    label: day.label,
    segments: [
      { value: day.present, color: PALETTE.present },
      { value: day.late, color: PALETTE.late },
      { value: day.absent, color: PALETTE.absent },
    ],
  }));

  // A single child has one record per day, so the daily rate reads as
  // present = 100, late = 50, absent or unmarked = 0.
  const dailyRate = trend.map((day) => {
    const marked = day.present + day.late + day.absent;

    return {
      label: day.label,
      value: marked ? Math.round(((day.present + day.late * 0.5) / marked) * 100) : 0,
    };
  });

  const tiles = [
    {
      label: "Attendance",
      value: stats ? `${stats.attendancePercent}%` : "—",
      hint: "marked today",
      icon: CalendarCheck,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Assignments",
      value: stats ? stats.pendingAssignments : "—",
      hint: "pending submission",
      icon: ClipboardList,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Visit Requests",
      value: stats ? stats.visitsAwaiting : "—",
      hint: "waiting for your answer",
      icon: CalendarClock,
      accent: "from-amber-500 to-orange-500",
    },
    {
      label: "Fees",
      value: stats ? stats.feeStatus : "—",
      hint:
        fees && fees.outstanding > 0
          ? `Rs. ${fees.outstanding.toLocaleString()} due`
          : "nothing pending",
      icon: Wallet,
      accent: "from-teal-500 to-emerald-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <section className="qd-ink relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-7 text-white sm:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Parent Dashboard
            </p>

            <h1 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">
              Welcome back, {dashboard?.name || "Parent"} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Monitor your child's academic progress, attendance, assignments,
              notices and home visits in real time.
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
          <button
            type="button"
            onClick={() => navigate("/parent/student")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Student Details
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/parent/location-requests")}
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Location Requests
          </button>

          <button
            type="button"
            onClick={() => navigate("/parent/attendance")}
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View Attendance
          </button>
        </div>
      </section>

      {/* Waiting on the parent */}
      {!loading && stats?.visitsAwaiting > 0 && (
        <button
          type="button"
          onClick={() => navigate("/parent/visit-requests")}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:bg-amber-100"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <CalendarClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </span>

            <span>
              <span className="block font-semibold text-amber-800 dark:text-amber-300">
                {stats.visitsAwaiting} home visit request
                {stats.visitsAwaiting === 1 ? "" : "s"} need your answer
              </span>

              <span className="mt-0.5 block text-sm text-amber-700 dark:text-amber-300">
                A teacher is waiting — the visit happens only after you accept it.
              </span>
            </span>
          </span>

          <ArrowRight className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        </button>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* CHILD */}
      <Panel title="My Child" subtitle="Linked student profile">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 font-bold text-white">
              {child?.name?.charAt(0)?.toUpperCase() || <User className="h-7 w-7" />}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {child?.name ?? (loading ? "Loading…" : "No child linked")}
              </h2>

              <p className="text-sm text-slate-500">
                {child?.studentId || "—"}
                {child?.className ? ` • ${child.className}` : ""}
                {child?.rollNumber ? ` • Roll ${child.rollNumber}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Class", value: child?.className },
              { label: "Section", value: child?.section },
              { label: "Student ID", value: child?.studentId },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <span
                  key={item.label}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {item.label}: {item.value}
                </span>
              ))}
          </div>
        </div>
      </Panel>

      {/* STATS */}
      <section className="qd-stagger grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map((tile) => (
          <StatCard
            key={tile.label}
            icon={tile.icon}
            label={tile.label}
            value={tile.value}
            hint={tile.hint}
            accent={tile.accent}
          />
        ))}
      </section>

      {/* ANALYTICS */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Attendance Trend"
          subtitle="Present / late / absent, last 14 days"
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
          title="Daily Attendance Score"
          subtitle="100 present • 50 late • 0 absent"
          className="lg:col-span-2"
        >
          {loading ? (
            <ChartSkeleton />
          ) : dailyRate.length ? (
            <RateLine data={dailyRate} color={PALETTE.present} />
          ) : (
            <EmptyChart message="No attendance recorded yet." />
          )}
        </Panel>

        <Panel title="Fee Summary" subtitle="Collected vs outstanding">
          {fees && feeTotal > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Paid</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {fees.paid.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Due</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    Rs. {fees.outstanding.toLocaleString()}
                  </p>
                </div>
              </div>

              <ProgressBar value={(fees.paid / feeTotal) * 100} color={PALETTE.paid} />

              <p className="text-xs text-slate-400">
                {Math.round((fees.paid / feeTotal) * 100)}% of total fees cleared
              </p>
            </div>
          ) : (
            <EmptyChart message="No fee records." />
          )}
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Assignment Progress" subtitle="Completed vs pending">
          {assignments ? (
            <Donut
              centerValue={assignments.completed + assignments.pending}
              centerLabel="total"
              data={[
                { label: "Completed", value: assignments.completed, color: PALETTE.completed },
                { label: "Pending", value: assignments.pending, color: PALETTE.pending },
              ]}
            />
          ) : (
            <ChartSkeleton />
          )}
        </Panel>

        <Panel
          title="Home Visits"
          subtitle="Teacher visit requests and outcomes"
          action={
            <button
              type="button"
              onClick={() => navigate("/parent/visit-requests")}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              Respond
            </button>
          }
        >
          {visits ? (
            <Donut
              centerValue={
                visits.awaiting +
                visits.scheduled +
                visits.started +
                visits.completed +
                visits.cancelled +
                visits.declined
              }
              centerLabel="visits"
              data={[
                { label: "Awaiting you", value: visits.awaiting, color: PALETTE.late },
                { label: "Accepted", value: visits.scheduled, color: PALETTE.present },
                { label: "Under way", value: visits.started, color: PALETTE.sky },
                { label: "Completed", value: visits.completed, color: PALETTE.completed },
                { label: "Declined", value: visits.declined, color: PALETTE.absent },
                { label: "Cancelled", value: visits.cancelled, color: PALETTE.pending },
              ]}
            />
          ) : (
            <ChartSkeleton />
          )}
        </Panel>
      </section>

      {/* ACTIONS */}
      <section>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900">Quick actions</h3>
          <p className="mt-1 text-xs text-slate-400">
            Everything you can review about your child
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            icon={Navigation}
            title="Location Requests"
            description="Approve or reject teacher requests for your child's home location."
            onClick={() => navigate("/parent/location-requests")}
            accent="from-emerald-500 to-teal-500"
          />
          <QuickAction
            icon={CalendarCheck}
            title="Attendance"
            description="View your child's day-by-day attendance records."
            onClick={() => navigate("/parent/attendance")}
            accent="from-teal-500 to-emerald-600"
          />
          <QuickAction
            icon={ClipboardList}
            title="Assignments"
            description="View assignments and academic activities."
            onClick={() => navigate("/parent/assignments")}
            accent="from-emerald-500 to-teal-500"
          />
          <QuickAction
            icon={CalendarClock}
            title="Visit Requests"
            description="Accept or decline the home visits a teacher requests."
            onClick={() => navigate("/parent/visit-requests")}
            accent="from-orange-500 to-amber-500"
          />
          <QuickAction
            icon={History}
            title="Home Visit History"
            description="Review previous teacher home visit records."
            onClick={() => navigate("/parent/visits")}
            accent="from-amber-500 to-orange-500"
          />
          <QuickAction
            icon={Bell}
            title="Notices"
            description="Read important college notices and announcements."
            onClick={() => navigate("/parent/notices")}
            accent="from-lime-500 to-emerald-500"
          />
          <QuickAction
            icon={Wallet}
            title="Fees"
            description="Track your child's fee payments and dues."
            onClick={() => navigate("/parent/fees")}
            accent="from-emerald-500 to-teal-600"
          />
        </div>
      </section>
    </div>
  );
}
