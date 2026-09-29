
import {
  ClipboardList,
  CheckCircle,
  Clock,
  CalendarDays,
  User,
} from "lucide-react";

// Frontend demo data
// Later this data will come from the backend API.
const assignments = [
  {
    id: 1,
    title: "React Assignment",
    subject: "Web Technology",
    teacher: "Mr. Ram Thapa",
    dueDate: "2026-09-30",
    status: "Pending",
    description:
      "Create a React component using useState and display a list of students.",
  },
  {
    id: 2,
    title: "Database Design",
    subject: "Database",
    teacher: "Mrs. Sita Sharma",
    dueDate: "2026-09-28",
    status: "Submitted",
    description:
      "Design a database schema for a school management system.",
  },
  {
    id: 3,
    title: "Demand and Supply",
    subject: "Economics",
    teacher: "Mr. Hari Gurung",
    dueDate: "2026-10-02",
    status: "Pending",
    description:
      "Explain the determinants of demand and supply with suitable examples.",
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
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Assignments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor your child's assignments and submission status.
        </p>
      </div>

      {/* =================================================
          ASSIGNMENT LIST
      ================================================= */}
      <div className="mt-6 space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            {/* Assignment Information */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <ClipboardList className="h-6 w-6 text-emerald-600" />
              </div>

              {/* Main Information */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-800">
                      {assignment.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.subject}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="sm:ml-4">
                    <StatusBadge status={assignment.status} />
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {assignment.description}
                </p>

                {/* Assignment Details */}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-4">
                  {/* Teacher */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />

                    <div>
                      <p className="text-xs text-slate-400">
                        Teacher
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {assignment.teacher}
                      </p>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}
      {assignments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />

          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            No Assignments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            There are currently no assignments available for your child.
          </p>
        </div>
      )}
    </div>
  );
}

