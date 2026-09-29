import {
  ClipboardList,
  CheckCircle,
  Clock,
  CalendarDays,
} from "lucide-react";

const assignments = [
  {
    id: 1,
    title: "React Assignment",
    subject: "Web Technology",
    dueDate: "2026-09-30",
    status: "Pending",
  },
  {
    id: 2,
    title: "Database Design",
    subject: "Database",
    dueDate: "2026-09-28",
    status: "Submitted",
  },
  {
    id: 3,
    title: "Demand and Supply",
    subject: "Economics",
    dueDate: "2026-10-02",
    status: "Pending",
  },
];

function StatusBadge({ status }) {
  if (status === "Submitted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle className="h-3.5 w-3.5" />
        Submitted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function Assignments() {
  return (
    <div className="mx-auto max-w-6xl">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Assignments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor your child's assignments and submission status.
        </p>
      </div>

      {/* Assignment List */}
      <div className="mt-6 space-y-4">

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >

            {/* Assignment Information */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <ClipboardList className="h-6 w-6 text-emerald-600" />
              </div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-slate-800">
                  {assignment.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {assignment.subject}
                </p>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 sm:block sm:text-right">
                <CalendarDays className="h-4 w-4 text-slate-400 sm:ml-auto" />

                <div>
                  <p className="text-xs text-slate-400">
                    Due Date
                  </p>

                  <p className="text-sm font-medium text-slate-700">
                    {assignment.dueDate}
                  </p>
                </div>
              </div>

            </div>

            {/* Status */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <StatusBadge status={assignment.status} />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}