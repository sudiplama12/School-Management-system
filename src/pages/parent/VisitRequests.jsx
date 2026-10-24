import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Home,
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const STATUS_LABEL = {
  awaiting_parent: { label: "Waiting for you", tone: "bg-amber-100 text-amber-700 dark:text-amber-300" },
  scheduled: { label: "Accepted", tone: "bg-emerald-100 text-emerald-700 dark:text-emerald-300" },
  started: { label: "Under way", tone: "bg-sky-100 text-sky-700 dark:text-sky-300" },
  completed: { label: "Completed", tone: "bg-emerald-100 text-emerald-700 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", tone: "bg-slate-100 text-slate-600" },
  declined: { label: "Declined", tone: "bg-red-100 text-red-700 dark:text-red-300" },
};

function StatusBadge({ status }) {
  const { label, tone } = STATUS_LABEL[status] || {
    label: status,
    tone: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}
    >
      <Clock className="h-4 w-4" />
      {label}
    </span>
  );
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-NP", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-NP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// One request card. A note lives with the card so a parent can explain a
// decline without a separate form.
function VisitCard({ visit, busy, onRespond }) {
  const [note, setNote] = useState("");

  const pending = visit.status === "awaiting_parent";

  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
          <Home className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Home visit request from {visit.teacherName || "a teacher"}
            </h2>

            <StatusBadge status={visit.status} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span>
                Student:{" "}
                <strong className="text-slate-700">
                  {visit.studentName || visit.studentId}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <span>{formatDate(visit.scheduledDate)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{formatTime(visit.scheduledDate)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{visit.locationName || "Address to be confirmed"}</span>
            </div>
          </div>

          {pending && (
            <div className="mt-4 space-y-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="Add a note for the teacher (optional)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => onRespond(visit.id, "approved", note)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept visit
                </button>

                <button
                  onClick={() => onRespond(visit.id, "rejected", note)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </div>
            </div>
          )}

          {!pending && visit.parentRespondedAt && (
            <p className="mt-4 text-xs text-slate-400">
              You answered on {formatDate(visit.parentRespondedAt)} at{" "}
              {formatTime(visit.parentRespondedAt)}.
            </p>
          )}

          {visit.responseNote && (
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Your note: {visit.responseNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisitRequests() {
  const { childStudentId } = useAuth();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);

    api
      .get("/home-visits")
      .then(({ data }) =>
        setVisits(
          (Array.isArray(data) ? data : []).map((visit) => ({
            ...visit,
            id: visit.id || visit._id,
          }))
        )
      )
      .catch((err) =>
        setError(
          err?.response?.data?.message || "Unable to load visit requests."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!childStudentId) {
      setError("No child is linked to this parent account.");
      setLoading(false);
      return;
    }

    load();
  }, [childStudentId, load]);

  const respond = async (id, status, note) => {
    setBusyId(id);
    setError("");

    try {
      await api.patch(`/home-visits/${id}/respond`, { status, note });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not record your answer.");
    } finally {
      setBusyId(null);
    }
  };

  const pending = visits.filter((visit) => visit.status === "awaiting_parent");
  const answered = visits.filter((visit) => visit.status !== "awaiting_parent");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Home Visit Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Accept or decline the home visits teachers request for your child.
        </p>
      </div>

      <div className="mb-6 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <h2 className="font-semibold text-emerald-800 dark:text-emerald-300">
            Nothing happens before you say yes
          </h2>

          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            A requested visit stays on hold until you accept it. Declining keeps
            the teacher from visiting, and they can ask again with a better time.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Waiting for you</p>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pending.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Accepted</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {visits.filter((visit) =>
              ["scheduled", "started", "completed"].includes(visit.status)
            ).length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Declined</p>
          <p className="mt-2 text-2xl font-bold text-slate-600">
            {visits.filter((visit) => visit.status === "declined").length}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-sm text-slate-500">Loading visit requests…</p>
        </div>
      )}

      {!loading && pending.length > 0 && (
        <div className="space-y-4">
          {pending.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              busy={busyId === visit.id}
              onRespond={respond}
            />
          ))}
        </div>
      )}

      {!loading && answered.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Answered requests
          </h2>

          <div className="space-y-4">
            {answered.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                busy={false}
                onRespond={respond}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && visits.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-slate-400" />

          <h2 className="mt-4 font-semibold text-slate-700">
            No visit requests
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Teachers have not requested a home visit for your child yet.
          </p>
        </div>
      )}
    </div>
  );
}
