import { useEffect, useState } from "react";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function StatusBadge({ status }) {
  if (status === "Accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        <CheckCircle className="h-4 w-4" />
        Accepted
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
        <XCircle className="h-4 w-4" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
      <Clock className="h-4 w-4" />
      Pending
    </span>
  );
}

export default function LocationRequests() {
  const { child, childStudentId } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/location-requests")
      .then(({ data }) => {
        setRequests(
          data.map((r) => ({
            id: r.id || r._id,
            teacher: r.teacherName || "A teacher",
            student: r.studentName || child?.name || r.studentId,
            reason: r.reason || "Location access",
            requestedAt: r.createdAt,
            status:
              r.status === "approved"
                ? "Accepted"
                : r.status === "rejected"
                ? "Rejected"
                : "Pending",
          }))
        );
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message || "Unable to load location requests."
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!childStudentId) {
      setError("No child is linked to this parent account.");
      setLoading(false);
      return;
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childStudentId]);

  const respond = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/location-requests/${id}/respond`, { status });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update request.");
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "—";

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const activeCount = requests.filter(
    (request) => request.status === "Accepted"
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Location Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review teacher requests before sharing your child's current location.
        </p>
      </div>

      {/* Privacy Information */}
      <div className="mb-6 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <h2 className="font-semibold text-emerald-800 dark:text-emerald-300">
            Your permission is required
          </h2>

          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Teachers cannot access your child's current location unless you
            accept the request. You can also stop location sharing later.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Requests</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {requests.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-card p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
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

      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-sm text-slate-500">
            Loading location requests…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-red-300" />
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Requests */}
      {!loading && !error && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                {/* Icon */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                  <MapPin className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Request Information */}
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
                      <span>
                        Requested: {formatDate(request.requestedAt)}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      Reason:{" "}
                      <strong className="text-slate-700">
                        {request.reason}
                      </strong>
                    </div>
                  </div>

                  {request.status === "Pending" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => respond(request.id, "approved")}
                        disabled={busyId === request.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </button>

                      <button
                        onClick={() => respond(request.id, "rejected")}
                        disabled={busyId === request.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Accepted Message */}
              {request.status === "Accepted" && (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Location sharing is active
                  </div>

                  <p className="mt-1">
                    The teacher is currently authorized to view the student's
                    current location.
                  </p>
                </div>
              )}

              {/* Rejected Message */}
              {request.status === "Rejected" && (
                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <XCircle className="h-4 w-4" />
                    Request rejected
                  </div>

                  <p className="mt-1">
                    The teacher cannot access the student's current location.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />

          <h2 className="mt-4 font-semibold text-slate-700">
            No location requests
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            You don't have any teacher location requests right now.
          </p>
        </div>
      )}
    </div>
  );
}
