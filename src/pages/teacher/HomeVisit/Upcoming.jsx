import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Navigation,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../../api/axios";

export default function Upcoming() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teacherId = "teacher1";

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/home-visits?teacherId=${teacherId}&status=scheduled`
      );

      setVisits(response.data || []);
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

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-NP",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
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
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm">
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
              <CalendarDays className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Upcoming Home Visits
              </h1>

              <p className="text-sm text-slate-500">
                View your scheduled student home visits.
              </p>
            </div>

          </div>

          <button
            onClick={loadVisits}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* VISITS */}

        {visits.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 font-semibold text-slate-700">
              No Upcoming Visits
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You do not have any scheduled home visits.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {visits.map((visit) => (

              <div
                key={visit._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >

                {/* TOP */}

                <div className="border-b border-slate-100 bg-emerald-50 p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                        <User className="h-5 w-5 text-emerald-600" />
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

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Scheduled
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

                  {visit.latitude !== undefined &&
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

                  {/* READY */}

                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">

                    <CheckCircle className="h-4 w-4 text-emerald-500" />

                    Ready for Home Visit

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}