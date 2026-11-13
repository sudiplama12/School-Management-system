import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Loader2,
  Save,
  Search,
  UserRound,
} from "lucide-react";
import api, { apiMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { PenMark } from "./Paper";

const todayString = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

// `short` is the letter the register prints in a column and `name` is what the
// button is called out to a screen reader — a box with a single pen stroke in it
// is not a label, however obvious it looks to somebody reading over the desk.
const KINDS = {
  student: {
    sheet: "/attendance/sheet",
    bulk: "/attendance/bulk",
    idField: "studentId",
    label: "class",
    blank: "No class selected.",
    statuses: [
      { value: "present", name: "Present", short: "P" },
      { value: "absent", name: "Absent", short: "A" },
      { value: "late", name: "Late", short: "L" },
    ],
  },
  teacher: {
    sheet: "/attendance/teacher/sheet",
    bulk: "/attendance/teacher/bulk",
    idField: "teacherId",
    label: "staff list",
    blank: "No active staff accounts.",
    statuses: [
      { value: "present", name: "Present", short: "P" },
      { value: "absent", name: "Absent", short: "A" },
      { value: "late", name: "Late", short: "L" },
      { value: "leave", name: "Leave", short: "Lv" },
    ],
  },
};

// A box printed on the file cover. The fill is the white of a printed form and
// the type is ink, both fixed, so the cover does not repaint with the theme.
const FIELD =
  "w-full rounded-sm border border-[color:var(--qd-manila-2)] bg-white/75 px-3 py-2.5 text-sm text-[color:var(--qd-sheet-ink)] outline-none focus:border-[color:var(--qd-pen)]";

const LABEL = "mb-2 block text-sm font-semibold text-[color:var(--qd-manila-ink)]";

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
            <h1 className="text-2xl font-bold text-slate-800">
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

      {/* The cover strip of the register: the class, the day, and the two
          presses that fill the whole book in one go. Manila, because a
          register is filed in a folder and the folder is not the page. */}
      <div className="qd-manila p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="sheet-date" className={LABEL}>
              Date
            </label>
            <input
              id="sheet-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={FIELD}
            />
          </div>

          {kind === "student" && (
            <div>
              <label
                htmlFor="sheet-class"
                className={LABEL}
              >
                Class
              </label>
              <select
                id="sheet-class"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className={FIELD}
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
              className={LABEL}
            >
              Find
            </label>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--qd-sheet-muted)]"
              />
              <input
                id="sheet-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or ID"
                className={`${FIELD} pl-10`}
              />
            </div>
          </div>

          {canMark && (
            <div>
              <span className={LABEL}>
                Whole sheet
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markAll("present")}
                  className="flex-1 rounded-sm border border-[color:var(--qd-manila-2)] px-3 py-2.5 text-xs font-semibold text-[color:var(--qd-manila-ink)] transition hover:bg-emerald-50"
                >
                  All present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("absent")}
                  className="flex-1 rounded-sm border border-[color:var(--qd-manila-2)] px-3 py-2.5 text-xs font-semibold text-[color:var(--qd-manila-ink)] transition hover:bg-red-50"
                >
                  All absent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The day's totals, foot-ruled like the bottom of a column in the book
          itself rather than floated above it in chips. */}
      <div className="flex flex-wrap gap-3">
        {config.statuses.map((status) => (
          <div key={status.value} className="qd-total px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--qd-sheet-muted)]">
              {status.name}
            </p>
            <p className="qd-hand mt-1 text-2xl leading-7">
              {counts[status.value] ?? 0}
            </p>
          </div>
        ))}
        <div className="qd-total px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--qd-sheet-muted)]">
            On the list
          </p>
          <p className="qd-hand mt-1 text-2xl leading-7">
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

      {/* The register: cream stock ruled one line per name, with the red margin
          down the left and the mark boxes lined up under their column. */}
      <div className="qd-register qd-margin overflow-x-auto">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-[color:var(--qd-sheet-muted)]">
            <Loader2 size={20} className="animate-spin" />
            Opening the book...
          </div>
        ) : shown.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 rounded-full border border-[color:var(--qd-sheet-edge)] p-4">
              <UserRound size={26} className="text-[color:var(--qd-sheet-muted)]" />
            </div>
            <h3 className="font-semibold">
              {rows.length === 0 ? config.blank : "No match"}
            </h3>
            <p className="mt-1 text-sm text-[color:var(--qd-sheet-muted)]">
              {rows.length === 0
                ? "Check the class or add accounts to it first."
                : "Nothing here fits that search."}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="qd-reg-row">
                <th className="px-5 py-3 pl-12 text-xs font-bold uppercase tracking-wide">
                  Name
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                  ID
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const index = rows.indexOf(row);
                const status = row.status ?? "present";

                return (
                  <tr key={row[config.idField]} className="qd-reg-row">
                    <td className="px-5 py-3 pl-12">
                      <p className="text-sm font-semibold">
                        {row.name}
                      </p>
                      <p className="text-xs text-[color:var(--qd-sheet-muted)]">
                        {[row.subject, row.rollNumber && `Roll ${row.rollNumber}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-sm">
                      {row[config.idField] || "—"}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {config.statuses.map((option) => {
                          const active = status === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              disabled={!canMark}
                              onClick={() => setStatus(index, option.value)}
                              aria-pressed={active}
                              aria-label={`${row.name}: ${option.name}`}
                              title={option.name}
                              className={`qd-cell relative flex h-10 w-11 shrink-0 flex-col items-center justify-center rounded-sm transition disabled:cursor-not-allowed ${
                                active
                                  ? ""
                                  : "opacity-55 hover:opacity-100 disabled:opacity-40"
                              }`}
                            >
                              {/* An empty box shows the letter it would be
                                  marked with; a marked box shows the stroke the
                                  pen actually made, and the letter goes under
                                  it so the column still reads. */}
                              {active ? (
                                <PenMark kind={option.value} size={19} />
                              ) : (
                                <span className="qd-hand text-base leading-5">
                                  {option.short}
                                </span>
                              )}
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
                        className="qd-cell qd-hand w-full rounded-sm px-3 py-1.5 text-base text-[color:var(--qd-pen)] outline-none placeholder:text-[color:var(--qd-sheet-muted)] focus:border-[color:var(--qd-pen)] disabled:opacity-60"
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
