import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Navigation,
  CheckCircle,
  RefreshCw,
  Plus,
  X,
  Send,
  Loader2,
} from "lucide-react";

import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

// datetime-local default: tomorrow at 10:00, local time.
const defaultVisitDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

// A request only becomes a confirmed visit once the parent accepts it, so the
// two states are shown differently throughout the list.
const VISIT_TONE = {
  awaiting_parent: {
    label: "Awaiting parent",
    chip: "bg-amber-100 text-amber-700 dark:text-amber-300",
    band: "bg-amber-50",
  },
  scheduled: {
    label: "Confirmed",
    chip: "bg-emerald-100 text-emerald-700 dark:text-emerald-300",
    band: "bg-emerald-50",
  },
};

export default function Upcoming() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { teacherId } = useAuth();

  // Schedule form state
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    scheduledDate: defaultVisitDate(),
    locationName: "",
    latitude: "",
    longitude: "",
    notify: true,
  });

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError("");

      // Both the requests still with the parent and the accepted ones are
      // upcoming work; the history page owns everything that has finished.
      const response = await api.get(
        `/home-visits?teacherId=${teacherId}&status=awaiting_parent,scheduled`
      );

      setVisits(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load upcoming visits."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);

      const response = await api.get("/teacher/students");
      const roster = Array.isArray(response.data) ? response.data : [];

      setStudents(
        roster.map((student) => ({
          studentId: student.studentId,
          name: student.name,
          className: student.className || "",
        }))
      );
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const openForm = () => {
    setFormError("");
    setFormSuccess("");
    setShowForm(true);

    if (students.length === 0) loadStudents();
  };

  const updateForm = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitVisit = async (event) => {
    event.preventDefault();

    if (!form.studentId) {
      setFormError("Please choose a student.");
      return;
    }
    if (!form.scheduledDate) {
      setFormError("Please pick a visit date and time.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const { data } = await api.post("/home-visits", {
        studentId: form.studentId,
        scheduledDate: form.scheduledDate,
        locationName: form.locationName,
        latitude: form.latitude,
        longitude: form.longitude,
        notify: form.notify,
      });

      setShowForm(false);
      setFormSuccess(
        data?.visit?.status === "awaiting_parent"
          ? "Request sent to the parent — the visit is confirmed once they accept."
          : "Home visit scheduled."
      );
      setForm({
        studentId: "",
        scheduledDate: defaultVisitDate(),
        locationName: "",
        latitude: "",
        longitude: "",
        notify: true,
      });

      await loadVisits();
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.message || "Could not schedule the visit."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Withdrawing is the only edit allowed before the parent answers.
  const cancelVisit = async (visit) => {
    if (!window.confirm(`Withdraw the visit request for ${visit.studentName || visit.studentId}?`)) {
      return;
    }

    setCancellingId(visit._id);
    setError("");

    try {
      await api.put(`/home-visits/${visit._id}`, { status: "cancelled" });
      await loadVisits();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not withdraw the request."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      "en-NP",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const openLocation = (visit) => {
    if (
      visit.latitude === undefined ||
      visit.longitude === undefined
    ) {
      return;
    }

    window.open(
      `https://www.openstreetmap.org/?mlat=${visit.latitude}&mlon=${visit.longitude}#map=17/${visit.latitude}/${visit.longitude}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-card shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading upcoming visits...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <CalendarDays className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Upcoming Home Visits
              </h1>

              <p className="text-sm text-slate-500">
                Requests waiting on a parent, and visits they have accepted.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={showForm ? () => setShowForm(false) : openForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              {showForm ? (
                <>
                  <X className="h-4 w-4" />
                  Close
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Request Visit
                </>
              )}
            </button>

            <button
              onClick={loadVisits}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

        </div>

        {/* SCHEDULE FORM */}

        {showForm && (
          <form
            onSubmit={submitVisit}
            className="mb-6 rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-800">
              Request a Home Visit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The request goes to your student's parent first. Nothing is
              confirmed until they accept, and the student is told as well.
            </p>

            {formError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                {formError}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Student
                </label>

                <select
                  value={form.studentId}
                  onChange={updateForm("studentId")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">
                    {loadingStudents ? "Loading students…" : "Select a student"}
                  </option>

                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.name} ({student.studentId}
                      {student.className ? ` • ${student.className}` : ""})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Date &amp; Time
                </label>

                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={updateForm("scheduledDate")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location Name <span className="text-slate-400">(optional)</span>
                </label>

                <input
                  type="text"
                  value={form.locationName}
                  onChange={updateForm("locationName")}
                  placeholder="e.g. Student's home address"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Latitude <span className="text-slate-400">(optional)</span>
                </label>

                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={updateForm("latitude")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Longitude <span className="text-slate-400">(optional)</span>
                </label>

                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={updateForm("longitude")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.notify}
                onChange={updateForm("notify")}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500"
              />
              Notify the student with a class notice
            </label>

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Sending…" : "Send Request"}
              </button>
            </div>
          </form>
        )}

        {/* SUCCESS */}

        {formSuccess && !showForm && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {formSuccess}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* VISITS */}

        {visits.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-12 text-center shadow-sm">

            <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 font-semibold text-slate-700">
              No Open Visit Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You have no pending requests and no visits the parent has accepted
              yet.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {visits.map((visit) => (

              <div
                key={visit._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm"
              >

                {/* TOP */}

                <div
                  className={`border-b border-slate-100 p-5 ${
                    VISIT_TONE[visit.status]?.band || "bg-emerald-50"
                  }`}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card">
                        <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>

                      <div>

                        <h2 className="font-semibold text-slate-800">
                          {visit.studentName ||
                            visit.studentId ||
                            "Student"}
                        </h2>

                        <p className="text-xs text-slate-500">
                          ID:{" "}
                          {visit.studentId || "-"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        VISIT_TONE[visit.status]?.chip ||
                        "bg-emerald-100 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {VISIT_TONE[visit.status]?.label || visit.status}
                    </span>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="p-5">

                  <div className="space-y-4">

                    {/* DATE */}

                    <div className="flex items-start gap-3">

                      <CalendarDays className="mt-0.5 h-5 w-5 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Visit Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(
                            visit.scheduledDate
                          )}
                        </p>
                      </div>

                    </div>

                    {/* TIME */}

                    <div className="flex items-start gap-3">

                      <Clock className="mt-0.5 h-5 w-5 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatTime(
                            visit.scheduledDate
                          )}
                        </p>
                      </div>

                    </div>

                    {/* LOCATION */}

                    <div className="flex items-start gap-3">

                      <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Home Location
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {visit.locationName ||
                            "Approved Student Location"}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* NAVIGATION */}

                  {visit.status === "scheduled" &&
                    visit.latitude !== undefined &&
                    visit.longitude !== undefined && (

                    <button
                      onClick={() =>
                        openLocation(visit)
                      }
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Navigation className="h-4 w-4" />
                      View Location
                    </button>

                  )}

                  {/* PARENT RESPONSE */}

                  {visit.status === "awaiting_parent" ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                        <Clock className="h-4 w-4" />
                        Waiting for {visit.parentName || "the parent"} to accept
                      </div>

                      <button
                        onClick={() => cancelVisit(visit)}
                        disabled={cancellingId === visit._id}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60"
                      >
                        {cancellingId === visit._id
                          ? "Withdrawing…"
                          : "Withdraw request"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {visit.parentRespondedAt
                        ? `Accepted by ${visit.parentName || "the parent"}`
                        : "Ready for Home Visit"}
                    </div>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}