import { useEffect, useState } from "react";

import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Navigation,
} from "lucide-react";

import api from "../../api/axios";

export default function LocationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");

  const parentId = "parent1";

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/location-requests/parent/${parentId}`
      );

      setRequests(response.data || []);

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load location requests."
      );

    } finally {
      setLoading(false);
    }
  };

  const approveRequest = (request) => {
    if (!navigator.geolocation) {
      setMessage(
        "Your browser does not support location services."
      );
      return;
    }

    setSharing(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          await api.post(
            "/location-requests/share-location",
            {
              requestId: request._id,
              studentId: request.studentId,
              parentId,
              latitude,
              longitude,
              accuracy,
            }
          );

          setMessage(
            "Home location approved and shared successfully."
          );

          await loadRequests();

        } catch (error) {
          console.error(error);

          setMessage(
            error.response?.data?.message ||
              "Failed to share location."
          );
        } finally {
          setSharing(false);
        }
      },
      (error) => {
        setSharing(false);

        if (error.code === 1) {
          setMessage(
            "Location permission was denied."
          );
        } else {
          setMessage(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.put(
        `/location-requests/${requestId}/reject`,
        {
          parentId,
        }
      );

      setMessage("Location request rejected.");

      await loadRequests();

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to reject request."
      );
    }
  };

  const pending = requests.filter(
    (item) => item.status === "pending"
  );

  const completed = requests.filter(
    (item) => item.status !== "pending"
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Location Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Approve or reject teacher requests for your child's
          home location.
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {/* PRIVACY INFO */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

        <div className="flex gap-3">

          <Navigation className="mt-1 h-5 w-5 text-blue-600" />

          <div>

            <h2 className="font-semibold text-blue-900">
              Location Privacy
            </h2>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Your location is shared only when you approve
              a teacher's home visit request. Chautari LMS
              does not continuously track your device.
            </p>

          </div>

        </div>

      </div>

      {/* LOADING */}
      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          Loading location requests...
        </div>
      ) : (
        <>
          {/* PENDING */}
          <section>

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-lg font-bold text-slate-800">
                Pending Requests
              </h2>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {pending.length} Pending
              </span>

            </div>

            {pending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <Clock className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-medium text-slate-600">
                  No pending requests
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {pending.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <User className="h-5 w-5 text-emerald-600" />

                          <h3 className="font-bold text-slate-800">
                            Home Visit Location Request
                          </h3>

                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-500">

                          <p>
                            <strong className="text-slate-700">
                              Student:
                            </strong>{" "}
                            {request.studentName ||
                              request.studentId}
                          </p>

                          <p>
                            <strong className="text-slate-700">
                              Teacher:
                            </strong>{" "}
                            {request.teacherName ||
                              request.teacherId}
                          </p>

                          <p>
                            <strong className="text-slate-700">
                              Requested:
                            </strong>{" "}
                            {request.createdAt
                              ? new Date(
                                  request.createdAt
                                ).toLocaleString()
                              : "Recently"}
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">

                        <button
                          onClick={() =>
                            approveRequest(request)
                          }
                          disabled={sharing}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <MapPin className="h-4 w-4" />

                          {sharing
                            ? "Getting Location..."
                            : "Accept & Share Location"}
                        </button>

                        <button
                          onClick={() =>
                            rejectRequest(request._id)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>

          {/* HISTORY */}
          <section>

            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Request History
            </h2>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[650px]">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-5 py-4 text-left text-xs uppercase text-slate-500">
                        Teacher
                      </th>

                      <th className="px-5 py-4 text-left text-xs uppercase text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs uppercase text-slate-500">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {completed.map((request) => (

                      <tr key={request._id}>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {request.teacherName ||
                            request.teacherId}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4">

                          {request.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              <XCircle className="h-3.5 w-3.5" />
                              Rejected
                            </span>
                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        </>
      )}

    </div>
  );
}