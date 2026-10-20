import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

export default function StudentLocation() {
  const { user, teacherId } = useAuth();

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Build the roster from the teacher's assigned students and overlay each
  // student's request status from GET /location-requests/teacher/:teacherId,
  // mirroring how Location.jsx reads the same endpoint.
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const [rosterResponse, requestResponse] = await Promise.all([
        api.get("/teacher/students"),
        api.get(`/location-requests/teacher/${teacherId}`),
      ]);

      const roster = Array.isArray(rosterResponse.data)
        ? rosterResponse.data
        : [];

      const requests = Array.isArray(requestResponse.data)
        ? requestResponse.data
        : [];

      const statusByStudent = {};
      requests.forEach((request) => {
        statusByStudent[request.studentId] = request.status;
      });

      setStudents(
        roster.map((student) => {
          const status = statusByStudent[student.studentId];

          return {
            id: student.studentId,
            name: student.name,
            className: student.className,
            locationStatus:
              status === "approved"
                ? "approved"
                : status === "pending"
                ? "pending"
                : "not_available",
          };
        })
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [teacherId]);

  const requestLocation = async (student) => {
    try {
      setBusyId(student.id);
      setError("");

      await api.post("/location-requests", {
        teacherId,
        teacherName: user?.name,
        studentId: student.id,
        studentName: student.name,
        reason: "Home visit location request",
        status: "pending",
      });

      await loadStudents();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not request the student location."
      );
    } finally {
      setBusyId(null);
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-card shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading students...
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
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Student Location
              </h1>

              <p className="text-sm text-slate-500">
                Request student home locations from parents.
              </p>
            </div>
          </div>
        </div>

        {/* PRIVACY INFO */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

            <div>
              <h2 className="font-semibold text-blue-900 dark:text-blue-300">
                Location Privacy
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-300">
                Teachers can only access a student's home
                location after the parent approves the request.
                The system does not continuously track students.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-card p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name or ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* STUDENTS */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => {
            const status = student.locationStatus;

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm"
              >
                {/* STUDENT */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      {student.name}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {student.id} • {student.className}
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Home Location Status
                  </p>

                  <div className="mt-2">
                    {status === "approved" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="h-4 w-4" />
                        Location Approved
                      </span>
                    )}

                    {status === "pending" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        <Clock className="h-4 w-4" />
                        Request Pending
                      </span>
                    )}

                    {status === "not_available" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <XCircle className="h-4 w-4" />
                        Location Not Available
                      </span>
                    )}
                  </div>
                </div>

                {/* ACTION */}
                <div className="mt-5">
                  {status === "not_available" && (
                    <button
                      onClick={() =>
                        requestLocation(student)
                      }
                      disabled={busyId === student.id}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {busyId === student.id ? "Requesting..." : "Request Location"}
                    </button>
                  )}

                  {status === "pending" && (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300"
                    >
                      <Clock className="h-4 w-4" />
                      Waiting for Parent
                    </button>
                  )}

                  {status === "approved" && (
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
                    >
                      <MapPin className="h-4 w-4" />
                      View Location
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
