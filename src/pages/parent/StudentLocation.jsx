import { useEffect, useState } from "react";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
} from "lucide-react";
import api from "../../api/axios";

export default function StudentLocationRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // DEMO PARENT
  // Later replace these with AuthContext user data
  // =====================================================
  const parentId = "parent1";

  // =====================================================
  // FETCH LOCATION REQUESTS
  // =====================================================
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get(
        `/location-requests/parent/${parentId}`
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load location requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // APPROVE + SHARE LOCATION
  // =====================================================
  const approveAndShareLocation = (request) => {
    if (!navigator.geolocation) {
      setMessage(
        "Your browser does not support location services."
      );
      return;
    }

    setLocationLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          await api.post(
            "/location-requests/share-location",
            {
              requestId: request._id,
              parentId,
              studentId: request.studentId,
              latitude,
              longitude,
              accuracy,
            }
          );

          setMessage(
            "Home location approved and shared successfully."
          );

          await fetchRequests();
        } catch (error) {
          console.error(
            "Failed to share location:",
            error
          );

          setMessage(
            error.response?.data?.message ||
              "Failed to share home location."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Location error:", error);

        setLocationLoading(false);

        if (error.code === 1) {
          setMessage(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setMessage(
            "Your location could not be determined."
          );
        } else if (error.code === 3) {
          setMessage(
            "Location request timed out. Please try again."
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

  // =====================================================
  // REJECT REQUEST
  // =====================================================
  const rejectRequest = async (requestId) => {
    try {
      setMessage("");

      await api.put(
        `/location-requests/${requestId}/reject`,
        {
          parentId,
        }
      );

      setMessage("Location request rejected.");

      await fetchRequests();
    } catch (error) {
      console.error(
        "Failed to reject request:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to reject location request."
      );
    }
  };

  // =====================================================
  // FILTER REQUESTS
  // =====================================================
  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );

  const respondedRequests = requests.filter(
    (request) => request.status !== "pending"
  );

  // =====================================================
  // LOADING SCREEN
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading location requests...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Home Location Requests
              </h1>

              <p className="text-sm text-slate-500">
                Review and respond to home visit location requests.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {/* =================================================
            LOCATION INFORMATION
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Navigation className="mt-1 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h2 className="font-semibold text-blue-900">
                Location Privacy
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Your home location is shared only after you
                approve a teacher's request. The system does
                not continuously track your location.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            PENDING REQUESTS
        ================================================= */}

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Pending Requests
            </h2>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Clock className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-700">
                No pending requests
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                New home visit requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Request details */}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-800">
                          Home Visit Location Request
                        </h3>

                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Student:
                          </span>{" "}
                          {request.studentName ||
                            request.studentId ||
                            "Unknown Student"}
                        </p>

                        <p className="text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Teacher:
                          </span>{" "}
                          {request.teacherName ||
                            request.teacherId ||
                            "Unknown Teacher"}
                        </p>

                        <p className="text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Requested:
                          </span>{" "}
                          {request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() =>
                          approveAndShareLocation(request)
                        }
                        disabled={locationLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <MapPin className="h-4 w-4" />

                        {locationLoading
                          ? "Sharing Location..."
                          : "Approve & Share Location"}
                      </button>

                      <button
                        onClick={() =>
                          rejectRequest(request._id)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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

        {/* =================================================
            REQUEST HISTORY
        ================================================= */}

        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Request History
          </h2>

          {respondedRequests.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No previous location requests.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Teacher
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {respondedRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {request.studentName ||
                            request.studentId ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {request.teacherName ||
                            request.teacherId ||
                            "-"}
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
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
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
          )}
        </section>
      </div>
    </div>
  );
}