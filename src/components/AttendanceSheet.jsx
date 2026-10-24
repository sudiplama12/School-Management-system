import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Loader2,
  Save,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import api, { apiMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const todayString = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const KINDS = {
  student: {
    sheet: "/attendance/sheet",
    bulk: "/attendance/bulk",
    idField: "studentId",
    label: "class",
    blank: "No class selected.",
    statuses: [
      { value: "present", name: "Present", icon: CheckCircle },
      { value: "absent", name: "Absent", icon: XCircle },
      { value: "late", name: "Late", icon: Clock },
    ],
  },
  teacher: {
    sheet: "/attendance/teacher/sheet",
    bulk: "/attendance/teacher/bulk",
    idField: "teacherId",
    label: "staff list",
    blank: "No active staff accounts.",
    statuses: [
      { value: "present", name: "Present", icon: CheckCircle },
      { value: "absent", name: "Absent", icon: XCircle },
      { value: "late", name: "Late", icon: Clock },
      { value: "leave", name: "Leave", icon: CalendarCheck },
    ],
  },
};

const PILL = {
  present: "bg-emerald-500 text-white border-emerald-500",
  absent: "bg-red-500 text-white border-red-500",
  late: "bg-amber-400 text-amber-950 border-amber-400",
  leave: "bg-sky-500 text-white border-sky-500",
};

// One sheet for both registers: the whole list opens already ticked Present and
// only the exceptions are clicked, so a class of thirty takes a handful of
// presses. Saving writes every row on screen, which is what makes an untouched
// sheet a "everyone was here" day.
export default function AttendanceSheet({ kind, title, subtitle }) {
  const config = KINDS[kind];
  const { user } = useAuth();

  const canMark =
    user?.role === "admin" || (kind === "student" && user?.role === "teacher");

  const [date, setDate] = useState(todayString);
  const [classes, setClasses] = useState([]);
  // A teacher opens on their own class; the office starts on the first class
  // the server knows about.
  const [className, setClassName] = useState(
    () => user?.assignedClasses?.[0] ?? ""
  );
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(config.sheet, {
        params: kind === "student" ? { date, className: className || undefined } : { date },
      });

      setRows(data.rows ?? []);

      if (data.classes) {
        setClasses(data.classes);
        if (!className && data.className) setClassName(data.className);
      }
    } catch (err) {
      setError(apiMessage(err, `Unable to load the ${config.label} sheet.`));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Re-opening a different day or class always reloads from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, className, kind]);

  const setStatus = (index, status) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, status } : row))
    );

  const setRemark = (index, remark) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, remark } : row))
    );

  const markAll = (status) =>
    setRows((current) => current.map((row) => ({ ...row, status })));

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return rows;

    return rows.filter((row) =>
      [row.name, row[config.idField], row.subject, row.rollNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [rows, search, config.idField]);

  const counts = useMemo(() => {
    const tally = {};

    rows.forEach((row) => {
      const value = row.status ?? "present";
      tally[value] = (tally[value] ?? 0) + 1;
    });

    return tally;
  }, [rows]);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post(config.bulk, {
        date,
        entries: rows.map((row) => ({
          [config.idField]: row[config.idField],
          status: row.status ?? "present",
          remark: row.remark ?? "",
        })),
      });

      // Reload first: load() clears the banner, so the confirmation has to be
      // the last thing written or it vanishes before it can be read.
      await load();
      setMessage(data.message);
    } catch (err) {
      setError(apiMessage(err, "The sheet could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:text-emerald-400">
            <CalendarCheck size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {title}
            </h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        {canMark && (
          <button
            type="button"
            onClick={save}
            disabled={loading || saving || rows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            Save sheet
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label
              htmlFor="sheet-date"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Date
            </label>
            <input
              id="sheet-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {kind === "student" && (
            <div>
              <label
                htmlFor="sheet-class"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Class
              </label>
              <select
                id="sheet-class"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
              >
                {classes.map((option) => (
                  <option key={option} value={option}>
                    Class {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="sheet-search"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Find
            </label>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="sheet-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {canMark && (
            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Whole sheet
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markAll("present")}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-emerald-50 dark:text-slate-300"
                >
                  All present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("absent")}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-red-50 dark:text-slate-300"
                >
                  All absent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {config.statuses.map((status) => (
          <div
            key={status.value}
            className="rounded-2xl border border-slate-200 bg-card px-5 py-3 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {status.name}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
              {counts[status.value] ?? 0}
            </p>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 bg-card px-5 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            On the list
          </p>
          <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
            {rows.length}
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading the sheet...
          </div>
        ) : shown.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-4">
              <UserRound size={26} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">
              {rows.length === 0 ? config.blank : "No match"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {rows.length === 0
                ? "Check the class or add accounts to it first."
                : "Nothing here fits that search."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const index = rows.indexOf(row);
                const status = row.status ?? "present";

                return (
                  <tr
                    key={row[config.idField]}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {row.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {[row.subject, row.rollNumber && `Roll ${row.rollNumber}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row[config.idField] || "—"}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {config.statuses.map((option) => {
                          const Icon = option.icon;
                          const active = status === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              disabled={!canMark}
                              onClick={() => setStatus(index, option.value)}
                              aria-pressed={active}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                active
                                  ? PILL[option.value]
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300"
                              }`}
                            >
                              <Icon size={14} />
                              {option.name}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <input
                        value={row.remark ?? ""}
                        disabled={!canMark}
                        onChange={(event) => setRemark(index, event.target.value)}
                        placeholder="Optional"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!canMark && (
        <p className="text-sm text-slate-500">
          Attendance is written by the office and by class teachers.
        </p>
      )}
    </div>
  );
}
