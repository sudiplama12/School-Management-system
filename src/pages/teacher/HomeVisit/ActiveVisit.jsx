import { useEffect, useState } from "react";
import {
  MapPin,
  User,
  Calendar,
  Clock,
  Navigation,
  CheckCircle,
  PlayCircle,
  Phone,
  FileText,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../../../api/axios";

export default function ActiveVisit() {
  const [visit, setVisit] = useState(null);

  const [visitStarted, setVisitStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [observation, setObservation] = useState("");
  const [parentFeedback, setParentFeedback] = useState("");
  const [remarks, setRemarks] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Demo teacher
  const teacherId = "teacher1";

  // =====================================================
  // LOAD ACTIVE / SCHEDULED VISIT
  // =====================================================

  const loadVisit = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/home-visits?teacherId=${teacherId}`
      );

      const visits = Array.isArray(response.data)
        ? response.data
        : response.data.visits || [];

      // Prefer started visit
      let currentVisit = visits.find(
        (item) => item.status === "started"
      );

      // Otherwise get scheduled visit
      if (!currentVisit) {
        currentVisit = visits.find(
          (item) => item.status === "scheduled"
        );
      }

      if (!currentVisit) {
        setVisit(null);
        return;
      }

      setVisit(currentVisit);

      setVisitStarted(
        currentVisit.status === "started"
      );

      setCompleted(
        currentVisit.status === "completed"
      );

      // Load existing notes
      setObservation(
        currentVisit.observation || ""
      );

      setParentFeedback(
        currentVisit.parentFeedback || ""
      );

      setRemarks(
        currentVisit.remarks || ""
      );

      setRecommendations(
        currentVisit.recommendations || ""
      );
    } catch (err) {
      console.error(
        "Failed to load active visit:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load home visit."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisit();
  }, []);

  // =====================================================
  // START VISIT
  // =====================================================

  const startVisit = async () => {
    if (!visit?._id) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await api.put(
        `/home-visits/${visit._id}`,
        {
          status: "started",
          startedAt: new Date(),
        }
      );

      const updatedVisit =
        response.data.visit ||
        response.data;

      setVisit(updatedVisit);

      setVisitStarted(true);
      setCompleted(false);

      setMessage(
        "Home visit started successfully."
      );
    } catch (err) {
      console.error(
        "Start visit error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to start visit."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // SAVE NOTES
  // =====================================================

  const saveNotes = async () => {
    if (!visit?._id) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await api.put(
        `/home-visits/${visit._id}`,
        {
          observation,
          parentFeedback,
          remarks,
          recommendations,
        }
      );

      const updatedVisit =
        response.data.visit ||
        response.data;

      setVisit(updatedVisit);

      setMessage(
        "Visit notes saved successfully."
      );
    } catch (err) {
      console.error(
        "Save notes error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save visit notes."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // COMPLETE VISIT
  // =====================================================

  const completeVisit = async () => {
    if (!visit?._id) return;

    if (
      !observation.trim() &&
      !remarks.trim() &&
      !recommendations.trim()
    ) {
      setError(
        "Please enter at least an observation, remark or recommendation before completing the visit."
      );

      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await api.put(
        `/home-visits/${visit._id}`,
        {
          status: "completed",
          completedAt: new Date(),

          observation,
          parentFeedback,
          remarks,
          recommendations,
        }
      );

      const updatedVisit =
        response.data.visit ||
        response.data;

      setVisit(updatedVisit);

      setVisitStarted(false);
      setCompleted(true);

      setMessage(
        "Home visit completed successfully. It is now available in Visit History."
      );
    } catch (err) {
      console.error(
        "Complete visit error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to complete visit."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // OPEN MAP
  // =====================================================

  const openMap = () => {
    if (
      visit?.latitude === null ||
      visit?.latitude === undefined ||
      visit?.longitude === null ||
      visit?.longitude === undefined
    ) {
      return;
    }

    window.open(
      `https://www.openstreetmap.org/?mlat=${visit.latitude}&mlon=${visit.longitude}#map=17/${visit.latitude}/${visit.longitude}`,
      "_blank"
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "N/A";
    }

    return value.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "N/A";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "N/A";
    }

    return value.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">

          <div className="text-center">

            <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading active visit...
            </p>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // NO VISIT
  // =====================================================

  if (!visit) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">

        <div className="mx-auto max-w-6xl">

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <MapPin className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 text-lg font-bold text-slate-700">
              No Active Visit
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There is no scheduled or active home visit for you.
            </p>

            <button
              onClick={loadVisit}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Refresh
            </button>

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

      <div className="mx-auto max-w-6xl">

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
                Active Home Visit
              </h1>

              <p className="text-sm text-slate-500">
                Manage your current student home visit.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-700">

            <CheckCircle className="h-5 w-5" />

            {message}

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">

            <AlertCircle className="h-5 w-5 shrink-0" />

            {error}

          </div>
        )}

        {/* =================================================
            STATUS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Visit Status
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span
                  className={`h-3 w-3 rounded-full ${
                    completed
                      ? "bg-emerald-500"
                      : visitStarted
                      ? "bg-blue-500"
                      : "bg-amber-400"
                  }`}
                />

                <span className="font-semibold text-slate-700">

                  {completed
                    ? "Visit Completed"
                    : visitStarted
                    ? "Visit In Progress"
                    : "Ready to Start"}

                </span>

              </div>

            </div>

            {!visitStarted &&
            !completed ? (

              <button
                onClick={startVisit}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <PlayCircle className="h-5 w-5" />
                )}

                Start Visit

              </button>

            ) : visitStarted ? (

              <button
                onClick={completeVisit}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}

                Complete Visit

              </button>

            ) : (

              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">

                <CheckCircle className="h-5 w-5" />

                Completed

              </div>

            )}

          </div>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* STUDENT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <h2 className="mb-5 text-lg font-bold text-slate-800">
              Student Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">

              <Info
                icon={<User />}
                label="Student"
                value={
                  visit.studentName ||
                  "N/A"
                }
              />

              <Info
                icon={<FileText />}
                label="Student ID"
                value={
                  visit.studentId ||
                  "N/A"
                }
              />

              <Info
                icon={<User />}
                label="Class"
                value={
                  visit.className ||
                  "N/A"
                }
              />

              <Info
                icon={<User />}
                label="Parent"
                value={
                  visit.parentName ||
                  visit.parentId ||
                  "N/A"
                }
              />

              <Info
                icon={<Phone />}
                label="Parent Contact"
                value={
                  visit.phone ||
                  "N/A"
                }
              />

              <Info
                icon={<MapPin />}
                label="Address"
                value={
                  visit.locationName ||
                  "Location not specified"
                }
              />

            </div>

          </div>

          {/* SCHEDULE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-bold text-slate-800">
              Visit Schedule
            </h2>

            <div className="space-y-5">

              <Info
                icon={<Calendar />}
                label="Date"
                value={formatDate(
                  visit.scheduledDate
                )}
              />

              <Info
                icon={<Clock />}
                label="Time"
                value={formatTime(
                  visit.scheduledDate
                )}
              />

              <Info
                icon={<MapPin />}
                label="Location"
                value={
                  visit.locationName ||
                  "Location not specified"
                }
              />

            </div>

          </div>

        </div>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-800">
                Student Home Location
              </h2>

              <p className="text-sm text-slate-500">
                Approved location shared by the parent.
              </p>

            </div>

            <MapPin className="h-6 w-6 text-emerald-600" />

          </div>

          <div className="rounded-2xl bg-slate-100 p-8 text-center">

            <MapPin className="mx-auto h-12 w-12 text-emerald-600" />

            <p className="mt-3 font-semibold text-slate-700">
              {visit.locationName ||
                "Home Location"}
            </p>

            {visit.latitude !== null &&
            visit.latitude !== undefined &&
            visit.longitude !== null &&
            visit.longitude !== undefined ? (

              <>
                <p className="mt-1 text-xs text-slate-500">
                  Coordinates:{" "}
                  {visit.latitude},{" "}
                  {visit.longitude}
                </p>

                <button
                  onClick={openMap}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >

                  <Navigation className="h-4 w-4" />

                  Open Navigation

                </button>
              </>

            ) : (

              <p className="mt-2 text-sm text-slate-400">
                No approved coordinates available.
              </p>

            )}

          </div>

        </div>

        {/* =================================================
            VISIT NOTES
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-800">
              Visit Notes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record the details of the home visit.
            </p>

          </div>

          {/* OBSERVATION */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Observation
            </label>

            <textarea
              rows="4"
              value={observation}
              onChange={(e) =>
                setObservation(
                  e.target.value
                )
              }
              disabled={
                !visitStarted ||
                completed
              }
              placeholder="Write your observation about the student's home learning environment and academic progress..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
            />

          </div>

          {/* PARENT FEEDBACK */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Parent Feedback
            </label>

            <textarea
              rows="3"
              value={parentFeedback}
              onChange={(e) =>
                setParentFeedback(
                  e.target.value
                )
              }
              disabled={
                !visitStarted ||
                completed
              }
              placeholder="Record feedback provided by the parent..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
            />

          </div>

          {/* REMARKS */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Remarks
            </label>

            <textarea
              rows="3"
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              disabled={
                !visitStarted ||
                completed
              }
              placeholder="Write additional remarks..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
            />

          </div>

          {/* RECOMMENDATIONS */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Recommendations
            </label>

            <textarea
              rows="3"
              value={recommendations}
              onChange={(e) =>
                setRecommendations(
                  e.target.value
                )
              }
              disabled={
                !visitStarted ||
                completed
              }
              placeholder="Write recommendations for the student and parent..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
            />

          </div>

          {/* SAVE */}

          {!completed && (
            <button
              onClick={saveNotes}
              disabled={
                !visitStarted ||
                actionLoading
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Save Visit Notes

            </button>
          )}

        </div>

      </div>

    </div>
  );
}

// =====================================================
// INFO COMPONENT
// =====================================================

function Info({ icon, label, value }) {
  return (
    <div className="flex gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

        <div className="h-5 w-5">
          {icon}
        </div>

      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}