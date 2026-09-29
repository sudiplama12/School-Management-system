
import { useMemo, useState } from "react";
import {
  MessageCircleQuestion,
  Send,
  User,
  Clock,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  X,
} from "lucide-react";

// =====================================================
// FRONTEND DEMO DATA
// Later this will come from the backend API.
// Admin will control which teachers a parent can query.
// =====================================================

const authorizedTeachers = [
  {
    id: 1,
    name: "Mrs. Sita Sharma",
    subject: "Class Teacher",
    className: "Grade 10 - Section A",
  },
  {
    id: 2,
    name: "Mr. Ram Thapa",
    subject: "Mathematics",
    className: "Grade 10 - Section A",
  },
  {
    id: 3,
    name: "Mrs. Mina KC",
    subject: "Science",
    className: "Grade 10 - Section A",
  },
];

const initialQueries = [
  {
    id: 1,
    teacher: "Mrs. Sita Sharma",
    subject: "Class Teacher",
    question:
      "I would like to know about my child's recent attendance and class participation.",
    date: "2026-09-27",
    time: "10:30 AM",
    status: "Replied",
    reply:
      "Your child has been attending classes regularly. Class participation has also been satisfactory.",
    replyDate: "2026-09-28",
  },
  {
    id: 2,
    teacher: "Mr. Ram Thapa",
    subject: "Mathematics",
    question:
      "Could you please provide some information about my child's performance in Mathematics?",
    date: "2026-09-25",
    time: "02:15 PM",
    status: "Pending",
    reply: "",
    replyDate: "",
  },
];

function StatusBadge({ status }) {
  if (status === "Replied") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle className="h-3.5 w-3.5" />
        Replied
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

export default function Queries() {
  const [teacherId, setTeacherId] = useState("");
  const [question, setQuestion] = useState("");
  const [queries, setQueries] = useState(initialQueries);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const pendingCount = useMemo(
    () => queries.filter((query) => query.status === "Pending").length,
    [queries]
  );

  const repliedCount = useMemo(
    () => queries.filter((query) => query.status === "Replied").length,
    [queries]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!teacherId || !question.trim()) {
      return;
    }

    const teacher = authorizedTeachers.find(
      (item) => item.id === Number(teacherId)
    );

    if (!teacher) return;

    const newQuery = {
      id: Date.now(),
      teacher: teacher.name,
      subject: teacher.subject,
      question: question.trim(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Pending",
      reply: "",
      replyDate: "",
    };

    setQueries((prev) => [newQuery, ...prev]);

    setTeacherId("");
    setQuestion("");
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <MessageCircleQuestion className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Queries
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Ask authorized teachers about your child's academic progress.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <MessageSquare className="h-4 w-4" />
          Ask a Teacher
        </button>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Queries
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {queries.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-800">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">
            Replied
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {repliedCount}
          </p>
        </div>
      </div>

      {/* =================================================
          QUERY LIST
      ================================================= */}
      <div className="mt-6 space-y-4">
        {queries.map((query) => (
          <div
            key={query.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {query.teacher.charAt(0)}
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    {query.teacher}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {query.subject}
                  </p>
                </div>
              </div>

              <StatusBadge status={query.status} />
            </div>

            {/* Question */}
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <MessageCircleQuestion className="h-4 w-4 text-slate-400" />

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Your Query
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-700">
                {query.question}
              </p>
            </div>

            {/* Reply */}
            {query.status === "Replied" && query.reply && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />

                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Teacher's Reply
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-700">
                  {query.reply}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Replied on {query.replyDate}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-4 w-4" />

                <span>
                  Sent {query.date} at {query.time}
                </span>
              </div>

              {query.status === "Replied" && (
                <button
                  type="button"
                  onClick={() => setSelectedQuery(query)}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View Conversation →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}
      {queries.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <MessageCircleQuestion className="mx-auto h-12 w-12 text-slate-300" />

          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            No Queries Yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            You have not sent any queries to teachers.
          </p>
        </div>
      )}

      {/* =================================================
          NEW QUERY MODAL
      ================================================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Ask a Teacher
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select an authorized teacher and send your query.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Teacher */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Teacher
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">
                      Select an authorized teacher
                    </option>

                    {authorizedTeachers.map((teacher) => (
                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {teacher.name} — {teacher.subject}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Teachers available here are authorized by the school
                  administrator.
                </p>
              </div>

              {/* Question */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Your Query
                </label>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  placeholder="Write your question about your child..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {question.length}/1000
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                  Send Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          CONVERSATION MODAL
      ================================================= */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Conversation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedQuery.teacher}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuery(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conversation */}
            <div className="space-y-4 p-6">
              {/* Parent message */}
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-emerald-600 p-4 text-white">
                <p className="text-xs font-semibold opacity-80">
                  You
                </p>

                <p className="mt-1 text-sm leading-6">
                  {selectedQuery.question}
                </p>

                <p className="mt-2 text-right text-xs opacity-70">
                  {selectedQuery.date} · {selectedQuery.time}
                </p>
              </div>

              {/* Teacher reply */}
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  {selectedQuery.teacher}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {selectedQuery.reply}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {selectedQuery.replyDate}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6">
              <button
                type="button"
                onClick={() => setSelectedQuery(null)}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

