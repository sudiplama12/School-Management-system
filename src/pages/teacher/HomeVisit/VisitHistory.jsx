import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  User,
  CheckCircle,
  Eye,
  FileText,
  Search,
  Navigation,
  RefreshCw,
  X,
} from "lucide-react";
import api from "../../../api/axios";

export default function VisitHistory() {
  const [search, setSearch] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Demo teacher ID
  const teacherId = "teacher1";

  // =====================================================
  // LOAD COMPLETED VISITS FROM BACKEND
  // =====================================================

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/home-visits?teacherId=${teacherId}&status=completed`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.visits || [];

      setVisits(data);
    } catch (err) {
      console.error("Failed to load visit history:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load visit history."
      );

      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredVisits = visits.filter((visit) => {
    const searchText = search.toLowerCase();

    return `
      ${visit.studentName || ""}
      ${visit.studentId || ""}
      ${visit.locationName || ""}
      ${visit.status || ""}
      ${visit.observation || ""}
    `
      .toLowerCase()
      .includes(searchText);
  });

  // =====================================================
  // OPEN MAP
  // =====================================================

  const openMap = (visit) => {
    if (
      visit.latitude === null ||
      visit.latitude === undefined ||
      visit.longitude === null ||
      visit.longitude === undefined
    ) {
      return;
    }

    window.open(
      `https://www.openstreetmap.org/?mlat=${visit.latitude}&mlon=${visit.longitude}#map=17/${visit.latitude}/${visit.longitude}`,
      "_blank"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading visit history...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Visit History
              </h1>

              <p className="text-sm text-slate-500">
                View completed home visit records.
              </p>
            </div>

          </div>

          <button
            onClick={loadVisits}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* COMPLETED VISITS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Completed Visits
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {visits.length}
                </p>
              </div>

            </div>
          </div>

          {/* STUDENTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Students Visited
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {
                    new Set(
                      visits.map(
                        (visit) => visit.studentId
                      )
                    ).size
                  }
                </p>
              </div>

            </div>
          </div>

          {/* TEACHER */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                <User className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Teacher
                </p>

                <p className="text-lg font-bold text-slate-800">
                  {teacherId}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search student, ID or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        {filteredVisits.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Visit Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredVisits.map((visit) => (

                    <tr
                      key={visit._id || visit.id}
                      className="hover:bg-slate-50"
                    >

                      {/* STUDENT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <User className="h-5 w-5 text-emerald-600" />
                          </div>

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              {visit.studentName || "Unknown Student"}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID: {visit.studentId || "N/A"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          <div>

                            <p className="text-sm font-medium text-slate-700">
                              {formatDate(
                                visit.completedAt ||
                                  visit.scheduledDate
                              )}
                            </p>

                            <p className="text-xs text-slate-400">
                              {formatTime(
                                visit.completedAt ||
                                  visit.scheduledDate
                              )}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* LOCATION */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <MapPin className="h-4 w-4 text-slate-400" />

                          <span className="text-sm text-slate-600">
                            {visit.locationName ||
                              "Location not specified"}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                          <CheckCircle className="h-3.5 w-3.5" />

                          {visit.status
                            ? visit.status
                                .charAt(0)
                                .toUpperCase() +
                              visit.status.slice(1)
                            : "Completed"}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() =>
                            setSelectedVisit(visit)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >

                          <Eye className="h-4 w-4" />

                          View Details

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <FileText className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No visit history found.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Completed home visits will appear here automatically.
            </p>

          </div>
        )}

      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedVisit && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Home Visit Details
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedVisit.studentName}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedVisit(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-5 p-5">

              {/* STUDENT INFORMATION */}

              <div className="grid gap-4 sm:grid-cols-2">

                <InfoBox
                  label="Student"
                  value={
                    selectedVisit.studentName ||
                    "N/A"
                  }
                />

                <InfoBox
                  label="Student ID"
                  value={
                    selectedVisit.studentId ||
                    "N/A"
                  }
                />

                <InfoBox
                  label="Visit Date"
                  value={formatDate(
                    selectedVisit.completedAt ||
                      selectedVisit.scheduledDate
                  )}
                />

                <InfoBox
                  label="Visit Time"
                  value={formatTime(
                    selectedVisit.completedAt ||
                      selectedVisit.scheduledDate
                  )}
                />

              </div>

              {/* LOCATION */}

              <div>

                <h3 className="mb-2 font-semibold text-slate-700">
                  Home Location
                </h3>

                <div className="rounded-xl bg-slate-50 p-4">

                  <div className="flex items-start gap-3">

                    <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />

                    <div>

                      <p className="text-sm font-medium text-slate-700">
                        {selectedVisit.locationName ||
                          "Location not specified"}
                      </p>

                      {selectedVisit.latitude !==
                        null &&
                        selectedVisit.latitude !==
                          undefined &&
                        selectedVisit.longitude !==
                          null &&
                        selectedVisit.longitude !==
                          undefined && (
                          <p className="mt-1 text-xs text-slate-400">
                            {selectedVisit.latitude},{" "}
                            {selectedVisit.longitude}
                          </p>
                        )}

                    </div>

                  </div>

                  {selectedVisit.latitude !==
                    null &&
                    selectedVisit.latitude !==
                      undefined &&
                    selectedVisit.longitude !==
                      null &&
                    selectedVisit.longitude !==
                      undefined && (

                    <button
                      onClick={() =>
                        openMap(selectedVisit)
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <Navigation className="h-4 w-4" />
                      Open Map
                    </button>

                  )}

                </div>

              </div>

              {/* OBSERVATION */}

              <DetailSection
                title="Observation"
                text={
                  selectedVisit.observation ||
                  "No observation recorded."
                }
              />

              {/* PARENT FEEDBACK */}

              <DetailSection
                title="Parent Feedback"
                text={
                  selectedVisit.parentFeedback ||
                  "No parent feedback recorded."
                }
              />

              {/* REMARKS */}

              <DetailSection
                title="Remarks"
                text={
                  selectedVisit.remarks ||
                  "No remarks recorded."
                }
              />

              {/* RECOMMENDATIONS */}

              <DetailSection
                title="Recommendations"
                text={
                  selectedVisit.recommendations ||
                  "No recommendations recorded."
                }
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// =====================================================
// INFO BOX
// =====================================================

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}

// =====================================================
// DETAIL SECTION
// =====================================================

function DetailSection({ title, text }) {
  return (
    <div>

      <h3 className="mb-2 font-semibold text-slate-700">
        {title}
      </h3>

      <div className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
        {text}
      </div>

    </div>
  );
}