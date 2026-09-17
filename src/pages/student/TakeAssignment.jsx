import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  FileText,
  Shuffle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "school_assignments";

export default function Assignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    try {
      const saved =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      setAssignments(saved);
    } catch {
      setAssignments([]);
    }
  }, []);

  const startAssignment = (assignment) => {
    navigate("/student/assignments/take", {
      state: {
        assignment,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <ClipboardList className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              My Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Assignments given by your teachers.
            </p>
          </div>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Available
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {assignments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {assignments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            0
          </p>
        </div>

      </div>

      {/* ASSIGNMENTS */}

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <FileText className="mx-auto h-14 w-14 text-slate-300" />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            No assignments available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your teacher has not given you any assignments yet.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
            >

              {/* TITLE */}

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div className="flex gap-4">

                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:flex">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                        {assignment.title}
                      </h2>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {assignment.type}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.subject} • {assignment.className}
                    </p>

                  </div>

                </div>

                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Pending
                </span>

              </div>

              {/* DETAILS */}

              <div className="mt-5 grid grid-cols-1 gap-4 border-y border-slate-100 py-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Time Limit
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {assignment.duration} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Questions
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {assignment.questions?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Due
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(
                        assignment.dueDate
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shuffle className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Questions
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {assignment.randomize
                        ? "Randomized"
                        : "Fixed Order"}
                    </p>
                  </div>
                </div>

              </div>

              {/* INSTRUCTIONS */}

              {assignment.instructions && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Teacher Instructions
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {assignment.instructions}
                  </p>

                </div>
              )}

              {/* START */}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Assignment given by teacher
                </div>

                <button
                  onClick={() =>
                    startAssignment(assignment)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Start Assignment
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}