
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Search,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

export default function Attendance() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-09-21");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch attendance
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attendance", {
        params: {
          date: selectedDate,
        },
      });

      const data = response?.data;

      if (Array.isArray(data)) {
        setAttendance(data);
      } else if (Array.isArray(data?.attendance)) {
        setAttendance(data.attendance);
      } else if (Array.isArray(data?.data)) {
        setAttendance(data.data);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      console.error("Attendance API Error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load attendance records."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  // Load attendance when date changes
  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // Search attendance
  const filteredAttendance = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (searchValue === "") {
      return attendance;
    }

    return attendance.filter((item) => {
      const studentName =
        item?.studentName ||
        item?.student?.name ||
        item?.student?.fullName ||
        "";

      const studentId =
        item?.studentId ||
        item?.student?.studentId ||
        item?.student?.id ||
        "";

      const className =
        item?.className ||
        item?.class?.name ||
        item?.class ||
        "";

      const status = item?.status || "";

      const rollNumber = item?.rollNumber || "";

      const searchText = [
        studentName,
        studentId,
        className,
        status,
        rollNumber,
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(searchValue);
    });
  }, [attendance, search]);

  // Attendance statistics
  const statistics = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    attendance.forEach((item) => {
      const status = String(item?.status || "").toLowerCase();

      if (status === "present") {
        present += 1;
      }

      if (status === "absent") {
        absent += 1;
      }

      if (status === "late") {
        late += 1;
      }
    });

    return {
      total: attendance.length,
      present,
      absent,
      late,
    };
  }, [attendance]);

  // Status badge
  const getStatusBadge = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "present") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle size={14} />
          Present
        </span>
      );
    }

    if (value === "absent") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          <XCircle size={14} />
          Absent
        </span>
      );
    }

    if (value === "late") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          <Clock size={14} />
          Late
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        <Clock size={14} />
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <CalendarCheck size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Attendance
              </h1>

              <p className="text-sm text-slate-500">
                Manage and view student attendance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAttendance}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={statistics.total}
            icon={<User size={22} />}
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Present"
            value={statistics.present}
            icon={<CheckCircle size={22} />}
            iconClass="bg-emerald-100 text-emerald-600"
          />

          <StatCard
            title="Absent"
            value={statistics.absent}
            icon={<XCircle size={22} />}
            iconClass="bg-red-100 text-red-600"
          />

          <StatCard
            title="Late"
            value={statistics.late}
            icon={<Clock size={22} />}
            iconClass="bg-amber-100 text-amber-600"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Date */}
            <div>
              <label
                htmlFor="attendance-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Date
              </label>

              <div className="relative">
                <CalendarCheck
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="attendance-date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Search */}
            <div>
              <label
                htmlFor="attendance-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search Student
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="attendance-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, ID, class..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-800">
              Attendance Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Date: {selectedDate}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                Loading attendance...
              </div>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-4">
                <CalendarCheck
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3 className="font-semibold text-slate-700">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No attendance data was found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student ID
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((item, index) => {
                    const studentName =
                      item?.studentName ||
                      item?.student?.name ||
                      item?.student?.fullName ||
                      "Unknown Student";

                    const studentId =
                      item?.studentId ||
                      item?.student?.studentId ||
                      item?.student?.id ||
                      "-";

                    const className =
                      item?.className ||
                      item?.class?.name ||
                      item?.class ||
                      "-";

                    const status = item?.status || "Unknown";

                    const date = item?.date
                      ? new Date(item.date).toLocaleDateString()
                      : selectedDate;

                    return (
                      <tr
                        key={
                          item?._id ||
                          item?.id ||
                          `${studentId}-${index}`
                        }
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <User size={17} />
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {studentName}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {studentId}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {className}
                        </td>

                        <td className="px-5 py-4">
                          {getStatusBadge(status)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================
function StatCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
