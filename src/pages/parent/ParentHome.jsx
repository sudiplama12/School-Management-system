import {
  User,
  MapPin,
  CalendarCheck,
  ClipboardList,
  Bell,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function ParentHome() {
  const navigate = useNavigate();

  const student = {
    id: "ST001",
    name: "Aarav Sharma",
    className: "BIM 6th Semester",
    section: "A",
    rollNo: "12",
  };

  const stats = [
    {
      title: "Attendance",
      value: "92%",
      description: "Current attendance",
      icon: CalendarCheck,
    },
    {
      title: "Assignments",
      value: "4",
      description: "Pending assignments",
      icon: ClipboardList,
    },
    {
      title: "Visits",
      value: "3",
      description: "Completed home visits",
      icon: MapPin,
    },
    {
      title: "Fees",
      value: "Paid",
      description: "Current fee status",
      icon: Wallet,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Welcome */}
      <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">

        <p className="text-sm font-medium text-emerald-400">
          Parent Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Welcome back, Parent
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Monitor your child's academic progress, attendance,
          assignments, notices and home visits.
        </p>

      </section>

      {/* CHILD */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-7 w-7 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                My Child
              </p>

              <h2 className="text-xl font-bold text-slate-800">
                {student.name}
              </h2>

              <p className="text-sm text-slate-500">
                {student.id} • {student.className}
              </p>
            </div>

          </div>

          <button
            onClick={() => navigate("/parent/student")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            View Student Details
            <ArrowRight className="h-4 w-4" />
          </button>

        </div>

      </section>

      {/* STATS */}
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

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                {stat.description}
              </p>

            </div>
          );
        })}

      </section>

      {/* ACTIONS */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        <ActionCard
          icon={MapPin}
          title="Location Requests"
          description="Approve or reject teacher requests for your child's home location."
          onClick={() => navigate("/parent/location-requests")}
        />

        <ActionCard
          icon={CalendarCheck}
          title="Attendance"
          description="View your child's attendance records."
          onClick={() => navigate("/parent/attendance")}
        />

        <ActionCard
          icon={ClipboardList}
          title="Assignments"
          description="View assignments and academic activities."
          onClick={() => navigate("/parent/assignments")}
        />

        <ActionCard
          icon={MapPin}
          title="Home Visit History"
          description="View previous teacher home visit records."
          onClick={() => navigate("/parent/visits")}
        />

        <ActionCard
          icon={Bell}
          title="Notices"
          description="View important college notices."
          onClick={() => navigate("/parent/notices")}
        />

        <ActionCard
          icon={Wallet}
          title="Fees"
          description="View your child's fee information."
          onClick={() => navigate("/parent/fees")}
        />

      </section>

    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>

      <h3 className="mt-5 font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </button>
  );
}