import { useState } from "react";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CalendarDays,
  ShieldCheck,
  Ban,
} from "lucide-react";

// Demo teacher location requests
const initialRequests = [
  {
    id: 1,
    teacher: "Mr. Ram Thapa",
    subject: "Mathematics",
    student: "Aarav Sharma",
    reason: "Home visit",
    requestedAt: "2026-09-29 10:15 AM",
    status: "Pending",
  },
  {
    id: 2,
    teacher: "Mrs. Sita Sharma",
    subject: "Class Teacher",
    student: "Aarav Sharma",
    reason: "Student safety check",
    requestedAt: "2026-09-28 02:30 PM",
    status: "Accepted",
  },
];

function StatusBadge({ status }) {
  if (status === "Accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle className="h-4 w-4" />
        Accepted
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
        <XCircle className="h-4 w-4" />
        Rejected
      </span>
    );
  }

  if (status === "Stopped") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <Ban className="h-4 w-4" />
        Sharing Stopped
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <Clock className="h-4 w-4" />
      Pending
    </span>
  );
}

export default function LocationRequests() {
  const [requests, setRequests] = useState(initialRequests);

  const updateStatus = (id, status) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? { ...request, status }
          : request
      )
    );
  };

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
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>

        <div>
          <h2 className="font-semibold text-emerald-800">
            Your permission is required
          </h2>

          <p className="mt-1 text-sm leading-6 text-emerald-700">
            Teachers cannot access your child's current location unless you
            accept the request. You can also stop location sharing later.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Requests</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {requests.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Location Sharing</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {activeCount}
          </p>
        </div>
      </div>

      {/* Requests */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              {/* Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                <MapPin className="h-7 w-7 text-emerald-600" />
              </div>

              {/* Request Information */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Current Location Request
                  </h2>

                  <StatusBadge status={request.status} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-500 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>
                      Teacher:{" "}
                      <strong className="text-slate-700">
                        {request.teacher}
                      </strong>
                    </span>
                  </div>

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
                      Requested: {request.requestedAt}
                    </span>
                  </div>

                  <div>
                    Reason:{" "}
                    <strong className="text-slate-700">
                      {request.reason}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-2">
                {request.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(request.id, "Rejected")
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(request.id, "Accepted")
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </button>
                  </>
                )}

                {request.status === "Accepted" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(request.id, "Stopped")
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Ban className="h-4 w-4" />
                    Stop Sharing
                  </button>
                )}
              </div>
            </div>

            {/* Accepted Message */}
            {request.status === "Accepted" && (
              <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
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
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center gap-2 font-semibold">
                  <XCircle className="h-4 w-4" />
                  Request rejected
                </div>

                <p className="mt-1">
                  The teacher cannot access the student's current location.
                </p>
              </div>
            )}

            {/* Stopped Message */}
            {request.status === "Stopped" && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-semibold">
                  <Ban className="h-4 w-4" />
                  Location sharing stopped
                </div>

                <p className="mt-1">
                  The teacher no longer has permission to view the student's
                  current location.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-300" />

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