import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import api from "../../api/axios";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    // The backend auto-scopes /attendance to the parent's child, so no
    // studentId is sent.
    api
      .get("/attendance")
      .then(({ data }) => {
        if (active) setRecords(data || []);
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load attendance."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const present = records.filter(
    (record) => String(record.status).toLowerCase() === "present"
  ).length;

  const absent = records.filter(
    (record) => String(record.status).toLowerCase() === "absent"
  ).length;

  const late = records.filter(
    (record) => String(record.status).toLowerCase() === "late"
  ).length;

  const percent = records.length
    ? Math.round(((present + late) / records.length) * 100)
    : 0;

  const summary = records.length ? `${percent}%` : "—";

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-2xl font-bold text-slate-800">
        Attendance
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        View your child's attendance record.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <Stat
          title="Attendance"
          value={loading ? "—" : summary}
          icon={CheckCircle}
        />

        <Stat
          title="Present"
          value={loading ? "—" : present}
          icon={CheckCircle}
        />

        <Stat
          title="Absent"
          value={loading ? "—" : absent}
          icon={XCircle}
        />

      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>
              <th className="p-4 text-left text-xs text-slate-500">
                Date
              </th>

              <th className="p-4 text-left text-xs text-slate-500">
                Class
              </th>

              <th className="p-4 text-left text-xs text-slate-500">
                Status
              </th>
            </tr>

          </thead>

          <tbody className="divide-y">

            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-sm text-slate-500">
                  Loading attendance…
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-sm text-slate-500">
                  No attendance records yet.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const status = String(record.status).toLowerCase();

                return (
                  <tr key={record._id || `${record.date}-${record.className}`}>

                    <td className="p-4 text-sm">
                      {record.date}
                    </td>

                    <td className="p-4 text-sm font-medium">
                      {record.className || "—"}
                    </td>

                    <td className="p-4">

                      {status === "present" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle className="h-3 w-3" />
                          Present
                        </span>
                      ) : status === "late" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                          <XCircle className="h-3 w-3" />
                          Absent
                        </span>
                      )}

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

      <p className="mt-3 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}
