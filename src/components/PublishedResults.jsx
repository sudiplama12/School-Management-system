import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Download,
  GraduationCap,
  Loader2,
  Printer,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { downloadReportCard, printReportCard } from "../utils/reportCard";
import { AnimatePresence, Reveal } from "./Motion";
import { Stamp } from "./Paper";
import { sheetProps } from "../utils/paper";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// A printed card carries no coloured chips: the printer's black, and the red
// pen the checker uses to mark a paper that was not sat or not passed.
const redPen = (row) => row.absent || row.grade === "F";

const ink = (row) => (redPen(row) ? "var(--qd-pen-red)" : "var(--qd-sheet-ink)");

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
      <div className="flex min-h-[280px] sm:min-h-[400px] items-center justify-center gap-2 text-sm text-slate-500">
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
          {/* One tab per term, cut from the same board as the folder below. */}
          <div className="flex flex-wrap items-end gap-2">
            {cards.map((item, index) => (
              <button
                key={item._id}
                onClick={() => setSelected(index)}
                className={`px-5 py-3 text-left transition ${
                  index === selected
                    ? "qd-manila -mb-px pb-4"
                    : "rounded-t-xl border border-b-0 border-slate-200 bg-card text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    index === selected ? "" : "text-slate-800"
                  }`}
                >
                  {item.term?.name}
                </p>
                <p
                  className={`mt-0.5 text-xs ${
                    index === selected ? "text-[color:var(--qd-manila-ink)]" : "text-slate-500"
                  }`}
                >
                  {item.term?.academicYear} · GPA {item.gpa ?? 0}
                  {item._id === best?._id ? " · best term" : ""}
                </p>
              </button>
            ))}
          </div>

          {card && (
            <div className="qd-manila p-3 sm:p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 px-2 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  {card.className} · {card.studentId}
                </p>
                <p className="qd-hand text-xl leading-6">
                  {card.term?.name} — {card.term?.academicYear}
                </p>
              </div>

              {/* Changing term plays the same gesture as taking a card out of the
                  file: the page rises up out of the folder below it. */}
              <AnimatePresence mode="wait">
                <Reveal
                  key={card._id}
                  {...sheetProps(0, { fold: true, tilt: 0, className: "pb-16 sm:pb-20" })}
                >
                  <header className="qd-letterhead px-5 py-5 sm:px-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--qd-sheet-margin)]">
                      {school?.name || "Smart School Management System"}
                    </p>
                    <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                      Statement of Marks
                    </h2>

                    <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-3">
                      {[
                        { label: "Name", value: card.studentName || user?.name },
                        { label: "Symbol No.", value: card.studentId },
                        {
                          label: "Class",
                          value: `${card.className}${
                            card.rollNumber ? ` · Roll ${card.rollNumber}` : ""
                          }`,
                        },
                        { label: "Examination", value: card.term?.name },
                        { label: "Session", value: card.term?.academicYear },
                        {
                          label: "Dates",
                          value: card.term?.startDate
                            ? `${formatDate(card.term.startDate)} → ${formatDate(card.term.endDate)}`
                            : card.term?.venue || "—",
                        },
                      ].map((field) => (
                        <div key={field.label}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--qd-sheet-muted)]">
                            {field.label}
                          </p>
                          <p className="text-sm font-semibold">{field.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </header>

                  <div className="px-5 py-5 sm:px-8">
                    <div className="qd-register overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em]">
                              Subject
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              Theory
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              Practical
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              Total
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              %
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              Grade
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              G.P.
                            </th>
                            <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.1em]">
                              Credits
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {card.subjects.map((row) => (
                            <tr key={String(row.subject)} className="qd-reg-row">
                              <td className="px-4 py-2.5 font-medium">
                                {row.subjectName}
                                {row.remarks && (
                                  <p className="qd-hand text-base leading-5 text-[color:var(--qd-pen)]">
                                    {row.remarks}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-right" style={{ color: ink(row) }}>
                                {row.absent ? "Ab" : `${row.theory ?? "-"} / ${row.theoryFull}`}
                              </td>
                              <td className="px-3 py-2.5 text-right" style={{ color: ink(row) }}>
                                {row.absent ? "Ab" : `${row.practical ?? "-"} / ${row.practicalFull}`}
                              </td>
                              <td
                                className="px-3 py-2.5 text-right font-bold"
                                style={{ color: ink(row) }}
                              >
                                {row.absent ? "Ab" : row.total ?? "-"}
                                <span className="ml-1 text-xs font-normal text-[color:var(--qd-sheet-muted)]">
                                  /{row.fullMarks}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right" style={{ color: ink(row) }}>
                                {row.absent ? "—" : row.percentage ?? "-"}
                              </td>
                              <td
                                className="px-3 py-2.5 text-right font-bold"
                                style={{ color: ink(row) }}
                              >
                                {row.grade || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-right" style={{ color: ink(row) }}>
                                {row.absent ? "—" : row.gradePoint ?? "-"}
                              </td>
                              <td className="px-3 py-2.5 text-right">{row.credits ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {[
                        { label: "Obtained", value: `${card.obtained ?? 0} / ${card.maximum ?? 0}` },
                        { label: "GPA", value: card.gpa ?? 0 },
                        { label: "Division", value: card.division || "—" },
                        {
                          label: "Result",
                          value: String(card.result || "pending").toUpperCase(),
                          tone:
                            card.result === "fail" ? "var(--qd-pen-red)" : "var(--qd-pen)",
                        },
                        {
                          label: "Attendance",
                          value: card.attendance?.total
                            ? `${card.attendance.present + card.attendance.late}/${card.attendance.total}`
                            : "—",
                          hint: card.attendance?.total
                            ? `${card.attendance.percentage}% present`
                            : "",
                        },
                      ].map((item) => (
                        <div key={item.label} className="qd-total px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--qd-sheet-muted)]">
                            {item.label}
                          </p>
                          <p
                            className="mt-1 text-xl font-bold"
                            style={{ color: item.tone || "var(--qd-sheet-ink)" }}
                          >
                            {item.value}
                          </p>
                          {item.hint && (
                            <p className="text-xs text-[color:var(--qd-sheet-muted)]">{item.hint}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {card.officeRemarks && (
                      <div className="mt-5 rounded-sm border border-[color:var(--qd-sheet-edge)] bg-white/45 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--qd-sheet-muted)]">
                          Office remarks
                        </p>
                        <p className="mt-1 text-sm">{card.officeRemarks}</p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                      <p className="max-w-xl text-xs leading-5 text-[color:var(--qd-sheet-muted)]">
                        Pass mark is 35% of each paper. An absent paper prints as Ab and is left out
                        of the GPA until it is sat.
                      </p>

                      <div className="flex flex-col items-center gap-1.5">
                        <Stamp>{card.publishedAt ? "Published" : "Draft"}</Stamp>
                        <p className="text-[11px] text-[color:var(--qd-sheet-muted)]">
                          {formatDate(card.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </AnimatePresence>

              {/* The lip of the folder is drawn over the foot of the card, so the
                  page climbs out of the file instead of standing beside it. */}
              <div className="qd-folder-pocket -mt-10 h-14 sm:-mt-12 sm:h-16" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
