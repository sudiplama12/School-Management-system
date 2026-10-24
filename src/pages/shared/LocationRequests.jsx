import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CalendarDays,
  ShieldCheck,
  Navigation,
  RefreshCw,
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { getLocation } from "../../utils/geolocation";

const STATUS_LABEL = {
  approved: "Accepted",
  rejected: "Rejected",
  pending: "Pending",
};

function StatusBadge({ status }) {
  const styles = {
    Accepted:
      "bg-emerald-100 text-emerald-700 dark:text-emerald-300",
    Rejected: "bg-red-100 text-red-700 dark:text-red-300",
    Pending: "bg-amber-100 text-amber-700 dark:text-amber-300",
  };

  const Icon = {
    Accepted: CheckCircle,
    Rejected: XCircle,
    Pending: Clock,
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      <Icon className="h-4 w-4" />
      {status}
    </span>
  );
}

const formatWhen = (value) => (value ? new Date(value).toLocaleString() : "—");

// One inbox for both families that can answer a teacher: a parent answering for
// their child, and a student answering for themself. The backend scopes the
// list to whoever is signed in, so only the copy differs here.
export default function LocationRequests() {
  const { user, child, childStudentId, studentId } = useAuth();

  const isStudent = user?.role === "student";
  const subject = isStudent ? "your" : "your child's";
  const subjectName = isStudent ? user?.name : child?.name;

  const [requests, setRequests] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  // Rows whose browser permission failed, so "accept without a location" can
  // appear beside the one that actually needs it.
  const [noFixIds, setNoFixIds] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/location-requests");
      const rows = Array.isArray(data) ? data : [];

      setRequests(
        rows.map((r) => ({
          id: r.id || r._id,
          teacher: r.teacherName || "A teacher",
          studentId: r.studentId,
          student: r.studentName || subjectName || r.studentId,
          reason: r.reason || "Location access",
          requestedAt: r.createdAt,
          status: STATUS_LABEL[r.status] || "Pending",
        }))
      );

      // The stored fix lives on the student, not on the request. Read each
      // student named in the inbox once; a 403/404 simply means nothing shared.
      const ids = [...new Set(rows.map((r) => r.studentId))];
      const found = await Promise.all(
        ids.map((id) =>
          api
            .get(`/location-requests/student/${id}`)
            .then(({ data: doc }) => [id, doc])
            .catch(() => [id, null])
        )
      );

      setLocations(
        Object.fromEntries(found.filter(([, doc]) => doc && doc.latitude))
      );
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load location requests.");
    } finally {
      setLoading(false);
    }
  }, [subjectName]);

  useEffect(() => {
    if (isStudent && !studentId) {
      setError("This account has no student id yet, so it cannot share a location.");
      setLoading(false);
      return;
    }

    if (!isStudent && !childStudentId) {
      setError("No child is linked to this parent account.");
      setLoading(false);
      return;
    }

    load();
  }, [isStudent, studentId, childStudentId, load]);

  const respond = async (request, status, fix) => {
    setBusyId(request.id);
    setActionError("");

    try {
      await api.patch(`/location-requests/${request.id}/respond`, {
        status,
        ...(fix || {}),
      });

      setNoFixIds((ids) => ids.filter((id) => id !== request.id));
      await load();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Could not update this request."
      );
    } finally {
      setBusyId(null);
    }
  };

  // Accepting means getting a real GPS fix first — that is what sends the exact
  // location to the teacher instead of an old, seeded one.
  const accept = async (request) => {
    setBusyId(request.id);
    setActionError("");

    let fix;

    try {
      fix = await getLocation();
    } catch (err) {
      setNoFixIds((ids) => (ids.includes(request.id) ? ids : [...ids, request.id]));
      setActionError(err.message);
      setBusyId(null);
      return;
    }

    try {
      await api.patch(`/location-requests/${request.id}/respond`, {
        status: "approved",
        ...fix,
      });

      await load();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Could not share the location."
      );
    } finally {
      setBusyId(null);
    }
  };

  const refresh = async (request) => {
    setBusyId(request.id);
    setActionError("");

    try {
      const fix = await getLocation();
      await api.put(`/location-requests/${request.id}/location`, fix);
      await load();
    } catch (err) {
      setActionError(err.message || "Could not send an updated location.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const activeCount = requests.filter((r) => r.status === "Accepted").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Location Requests</h1>

        <p className="mt-1 text-sm text-slate-500">
          {isStudent
            ? "Teacher requests for your location. Nothing is shared until you accept one."
            : "Review teacher requests before sharing your child's current location."}
        </p>
      </div>

      <div className="mb-6 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <h2 className="font-semibold text-emerald-800 dark:text-emerald-300">
            Your permission is required
          </h2>

          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Accepting shares {subject} exact position with that teacher so they
            can plan the quickest way to the house. You can send a fresher
            position later, or stop sharing at any time.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Requests</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {requests.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Waiting for you</p>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Location Sharing</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </p>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-sm text-slate-500">Loading location requests…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-red-300" />
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {requests.map((request) => {
            const shared = locations[request.studentId];
            const busy = busyId === request.id;

            return (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                    <MapPin className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-800">
                        Location request from {request.teacher}
                      </h2>

                      <StatusBadge status={request.status} />
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-500 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>
                          Student:{" "}
                          <strong className="text-slate-700">
                            {request.student}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span>Requested: {formatWhen(request.requestedAt)}</span>
                      </div>

                      <div className="sm:col-span-2">
                        Reason:{" "}
                        <strong className="text-slate-700">{request.reason}</strong>
                      </div>
                    </div>

                    {request.status === "Pending" && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => accept(request)}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Navigation className="h-4 w-4" />
                          {busy ? "Getting your location…" : "Accept & share my location"}
                        </button>

                        {noFixIds.includes(request.id) && (
                          <button
                            onClick={() => respond(request, "approved")}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept without a location
                          </button>
                        )}

                        <button
                          onClick={() => respond(request, "rejected")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {request.status === "Rejected" && (
                      <button
                        onClick={() => accept(request)}
                        disabled={busy}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                      >
                        <Navigation className="h-4 w-4" />
                        {busy ? "Getting your location…" : "Change mind and share"}
                      </button>
                    )}
                  </div>
                </div>

                {request.status === "Accepted" && (
                  <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="h-4 w-4" />
                        Sharing is active
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => refresh(request)}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {busy ? "Sending…" : "Send updated location"}
                        </button>

                        <button
                          onClick={() => respond(request, "rejected")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-card px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Stop sharing
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-300">
                      {shared ? (
                        <>
                          The teacher sees{" "}
                          <strong>
                            {Number(shared.latitude).toFixed(5)},{" "}
                            {Number(shared.longitude).toFixed(5)}
                          </strong>
                          {shared.locationName ? ` (${shared.locationName})` : ""}.
                          Accurate to about {shared.accuracy || "—"} m, sent{" "}
                          {formatWhen(shared.recordedAt || shared.updatedAt)}.
                        </>
                      ) : (
                        `Accepted, but ${subject} position has not been sent yet. Use “Send updated location” once the browser allows it.`
                      )}
                    </p>
                  </div>
                )}

                {request.status === "Rejected" && (
                  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300">
                    <div className="flex items-center gap-2 font-semibold">
                      <XCircle className="h-4 w-4" />
                      Nothing is shared
                    </div>

                    <p className="mt-1">
                      The teacher cannot see {subject} location.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />

          <h2 className="mt-4 font-semibold text-slate-700">
            No location requests
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No teacher has asked for {subject} location yet.
          </p>
        </div>
      )}
    </div>
  );
}
