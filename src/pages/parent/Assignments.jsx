
import { useEffect, useState } from "react";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  CalendarDays,
  User,
  Award,
} from "lucide-react";
import api from "../../api/axios";

function StatusBadge({ status }) {
  if (status === "Submitted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        <CheckCircle className="h-3.5 w-3.5" />
        Submitted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/assignments")
      .then(({ data }) => {
        if (active) setAssignments(data);
      })
      .catch((err) => {
        if (active)
          setError(err?.response?.data?.message || "Unable to load assignments.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "No deadline";

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

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-6 text-sm text-slate-500">Loading assignments…</p>
      )}

      {/* =================================================
          ASSIGNMENT LIST
      ================================================= */}
      {!loading && (
        <div className="mt-6 space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Assignment Information */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <ClipboardList className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                      <StatusBadge
                        status={assignment.submitted ? "Submitted" : "Pending"}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {assignment.instructions && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {assignment.instructions}
                    </p>
                  )}

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
                          {assignment.teacherName || "—"}
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
                          {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    {assignment.submitted && assignment.score != null && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-xs text-slate-400">
                            Score
                          </p>

                          <p className="text-sm font-medium text-slate-700">
                            {assignment.score}
                            {assignment.totalMarks != null
                              ? ` / ${assignment.totalMarks}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================
          EMPTY STATE
      ================================================= */}
      {!loading && assignments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-card p-10 text-center shadow-sm">
          <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />

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
