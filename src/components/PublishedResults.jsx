import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Download,
  GraduationCap,
  Loader2,
  Printer,
  User,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { downloadReportCard, printReportCard } from "../utils/reportCard";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const GRADE_TONE = {
  "A+": "bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  A: "bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  "B+": "bg-teal-50 text-teal-700 dark:text-teal-300",
  B: "bg-teal-50 text-teal-700 dark:text-teal-300",
  "C+": "bg-sky-50 text-sky-700 dark:text-sky-300",
  C: "bg-sky-50 text-sky-700 dark:text-sky-300",
  D: "bg-amber-50 text-amber-700 dark:text-amber-300",
  F: "bg-red-50 text-red-700 dark:text-red-300",
  Ab: "bg-slate-100 text-slate-500 dark:text-slate-300",
};

// One screen for both family portals: the student's own card and a parent's
// child's card come from the same published-only endpoint.
export default function PublishedResults({ heading = "My Results", blurb }) {
  const { school, user } = useAuth();

  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await api.get("/results/me");

        if (cancelled) return;

        setCards(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;

        setError(err?.response?.data?.message || "Unable to load your results.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const card = cards[selected];

  const best = useMemo(
    () =>
      cards.reduce((top, item) => ((item.gpa ?? 0) > (top?.gpa ?? -1) ? item : top), cards[0]),
    [cards]
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 size={20} className="animate-spin" />
        Loading your grade sheets…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {school?.name || "SMART SCHOOL MANAGEMENT SYSTEM"}
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <GraduationCap size={26} className="text-emerald-600 dark:text-emerald-400" />
            {heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {blurb ||
              "Only results the school has published appear here. Download the PDF or print the card on A4 paper."}
          </p>
        </div>

        {card && (
          <div className="flex gap-2">
            <button
              onClick={() => printReportCard({ school, result: card })}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200"
            >
              <Printer size={18} /> Print
            </button>
            <button
              onClick={() => downloadReportCard({ school, result: card })}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Download size={18} /> Download PDF
            </button>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {!cards.length ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-card px-6 text-center">
          <div className="mb-3 rounded-full bg-slate-100 p-4">
            <CalendarDays size={26} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700">No published results yet</h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Marks entered by subject teachers appear here once the office publishes the class for
            that exam term.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {cards.map((item, index) => (
              <button
                key={item._id}
                onClick={() => setSelected(index)}
                className={`rounded-2xl border px-5 py-4 text-left transition ${
                  index === selected
                    ? "border-emerald-500 bg-emerald-50/70 shadow-sm dark:bg-emerald-500/10"
                    : "border-slate-200 bg-card hover:border-emerald-300"
                }`}
              >
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {item.term?.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.term?.academicYear} · GPA {item.gpa ?? 0}
                  {item._id === best?._id ? " · best term" : ""}
                </p>
              </button>
            ))}
          </div>

          {card && (
            <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:text-emerald-400">
                    <User size={22} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {card.studentName || user?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {card.studentId} · {card.className}
                      {card.rollNumber ? ` · Roll ${card.rollNumber}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right text-sm text-slate-500">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {card.term?.name} — {card.term?.academicYear}
                  </p>
                  <p>
                    {card.term?.startDate
                      ? `${formatDate(card.term.startDate)} → ${formatDate(card.term.endDate)}`
                      : ""}
                  </p>
                  <p>{card.term?.venue || ""}</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-3 py-3">Theory</th>
                      <th className="px-3 py-3">Practical</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">%</th>
                      <th className="px-3 py-3">Grade</th>
                      <th className="px-3 py-3">G.P.</th>
                      <th className="px-3 py-3">Credits</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {card.subjects.map((row) => (
                      <tr key={String(row.subject)}>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {row.subjectName}
                          {row.remarks && (
                            <p className="text-xs font-normal text-slate-400">{row.remarks}</p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {row.absent ? "Ab" : `${row.theory ?? "-"} / ${row.theoryFull}`}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {row.absent ? "Ab" : `${row.practical ?? "-"} / ${row.practicalFull}`}
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {row.absent ? "Ab" : row.total ?? "-"}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            /{row.fullMarks}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {row.absent ? "—" : row.percentage ?? "-"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              GRADE_TONE[row.grade] || "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {row.grade || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {row.absent ? "—" : row.gradePoint ?? "-"}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{row.credits ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Obtained", value: `${card.obtained ?? 0} / ${card.maximum ?? 0}` },
                  { label: "GPA", value: card.gpa ?? 0 },
                  { label: "Division", value: card.division || "—" },
                  {
                    label: "Result",
                    value: String(card.result || "pending").toUpperCase(),
                    tone:
                      card.result === "fail"
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    label: "Attendance",
                    value: card.attendance?.total
                      ? `${card.attendance.present + card.attendance.late}/${card.attendance.total}`
                      : "—",
                    hint: card.attendance?.total ? `${card.attendance.percentage}% present` : "",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-slate-50 p-4 dark:bg-transparent dark:ring-1 dark:ring-slate-200"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className={`mt-1 text-xl font-bold ${item.tone || "text-slate-900"}`}>
                      {item.value}
                    </p>
                    {item.hint && <p className="text-xs text-slate-400">{item.hint}</p>}
                  </div>
                ))}
              </div>

              {card.officeRemarks && (
                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Office remarks
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {card.officeRemarks}
                  </p>
                </div>
              )}

              <p className="mt-5 text-xs leading-5 text-slate-400">
                Pass mark is 35% of each paper. An absent paper prints as Ab and is left out of the
                GPA until it is sat. Published {formatDate(card.publishedAt)}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
