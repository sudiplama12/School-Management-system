import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Printer,
  Save,
  Search,
  User,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { gradeFor, gradeTone } from "../../utils/grading";
import { downloadReportCard, printReportCard } from "../../utils/reportCard";

// A cell is blank until the teacher types in it. Saving a blank leaves the row
// unentered, which is different from a zero and keeps the card honest.
const draftOf = (row) => ({
  ...row,
  theory: row.theory === null || row.theory === undefined ? "" : String(row.theory),
  practical:
    row.practical === null || row.practical === undefined ? "" : String(row.practical),
  absent: Boolean(row.absent),
  remarks: row.remarks || "",
});

const unchanged = (draft, saved) =>
  draft.theory === saved.theory &&
  draft.practical === saved.practical &&
  draft.absent === saved.absent &&
  draft.remarks === saved.remarks;

const number = (value) => (value === "" ? NaN : Number(value));

const BLANK_ROW = { theory: "", practical: "", absent: false, remarks: "" };

// The same rules the backend applies, run on the cell being edited so the
// teacher sees the grade before saving.
const preview = (draft) => {
  if (draft.absent) {
    return { total: 0, grade: "Ab", gradePoint: null, passed: null };
  }

  const theory = number(draft.theory);
  const practical = number(draft.practical);

  if (!Number.isFinite(theory) && !Number.isFinite(practical)) return null;

  const total = (Number.isFinite(theory) ? theory : 0) + (Number.isFinite(practical) ? practical : 0);
  const graded = gradeFor(total, draft.fullMarks);

  return { total, ...graded };
};

const cellProblem = (draft, field, max) => {
  if (draft.absent) return "";

  const value = number(draft[field]);

  if (draft[field] === "") return "";
  if (!Number.isFinite(value) || value < 0) return "Enter a positive number.";
  if (value > max) return `This paper is out of ${max}.`;

  return "";
};

export default function TeacherResults() {
  const [view, setView] = useState("entry");
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [termId, setTermId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [sheet, setSheet] = useState(null);
  const [drafts, setDrafts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLists = async () => {
    setLoading(true);
    setError("");

    try {
      const [termRes, subjectRes] = await Promise.all([
        api.get("/results/terms"),
        api.get("/results/subjects"),
      ]);

      const termList = Array.isArray(termRes.data) ? termRes.data : [];
      const subjectList = Array.isArray(subjectRes.data) ? subjectRes.data : [];

      setTerms(termList);
      setSubjects(subjectList);

      setTermId((current) => {
        if (current && termList.some((term) => term._id === current)) return current;

        return termList.find((term) => !term.archived)?._id || termList[0]?._id || "";
      });

      setSubjectId((current) => {
        if (current && subjectList.some((subject) => subject._id === current)) {
          return current;
        }

        return subjectList[0]?._id || "";
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load the mark sheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (!termId || !subjectId) {
      setSheet(null);
      setDrafts([]);
      return;
    }

    let cancelled = false;

    const loadSheet = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const res = await api.get("/results/sheet", {
          params: { term: termId, subject: subjectId },
        });

        if (cancelled) return;

        setSheet(res.data);
        setDrafts((res.data?.marks || []).map(draftOf));
      } catch (err) {
        if (cancelled) return;

        setSheet(null);
        setDrafts([]);
        setError(err?.response?.data?.message || "Unable to load this mark sheet.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSheet();

    return () => {
      cancelled = true;
    };
  }, [termId, subjectId]);

  const edit = (studentId, field, value) =>
    setDrafts((current) =>
      current.map((row) => (row.student === studentId ? { ...row, [field]: value } : row))
    );

  const savedById = useMemo(
    () => new Map((sheet?.marks || []).map((row) => [row.student, draftOf(row)])),
    [sheet]
  );

  // Only cells that differ from what the database already holds go up, so a
  // teacher editing one mark cannot rewrite a class of rows.
  const dirtyRows = useMemo(
    () => drafts.filter((draft) => !unchanged(draft, savedById.get(draft.student) || BLANK_ROW)),
    [drafts, savedById]
  );

  const issuesOf = (draft) => ({
    theory: cellProblem(draft, "theory", sheet?.subject?.theoryFull ?? 0),
    practical: cellProblem(draft, "practical", sheet?.subject?.practicalFull ?? 0),
  });

  const hasIssues = drafts.some((draft) => {
    const issue = issuesOf(draft);

    return issue.theory || issue.practical;
  });

  const enteredCount = drafts.filter(
    (draft) => draft.absent || Number.isFinite(number(draft.theory)) || Number.isFinite(number(draft.practical))
  ).length;

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return drafts;

    return drafts.filter((row) =>
      [row.name, row.studentId, row.rollNumber].join(" ").toLowerCase().includes(needle)
    );
  }, [drafts, search]);

  const save = async () => {
    if (hasIssues) {
      setError("Fix the highlighted cells before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await api.patch("/results/sheet", {
        term: termId,
        subject: subjectId,
        marks: dirtyRows.map((row) => ({
          student: row.student,
          absent: row.absent,
          theory: row.absent || row.theory === "" ? null : Number(row.theory),
          practical: row.absent || row.practical === "" ? null : Number(row.practical),
          remarks: row.remarks,
        })),
      });

      const locked = res.data?.locked?.length || 0;

      setMessage(
        locked
          ? `${res.data?.saved?.length || 0} saved. ${locked} sheet${locked === 1 ? "" : "s"} are already published and were left alone — ask the office to reopen the class.`
          : res.data?.message || "Marks saved."
      );

      const refreshed = await api.get("/results/sheet", {
        params: { term: termId, subject: subjectId },
      });

      setSheet(refreshed.data);
      setDrafts((refreshed.data?.marks || []).map(draftOf));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save these marks.");
    } finally {
      setSaving(false);
    }
  };

  const subject = sheet?.subject;
  const publishedLock = Boolean(sheet) && sheet.marks.length > 0 && sheet.marks.every((row) => row.published);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            SMART SCHOOL MANAGEMENT SYSTEM
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <GraduationCap size={26} className="text-emerald-600 dark:text-emerald-400" />
            {view === "entry" ? "Mark Entry" : "Report Cards"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {view === "entry"
              ? "Enter theory and practical marks for the papers you own. The office publishes them before families can see or print anything."
              : "Print or download a card for a student you teach. Drafts print marked as proofs; families only ever receive a published card."}
          </p>
        </div>

        {view === "entry" && (
          <button
            type="button"
            onClick={save}
            disabled={saving || hasIssues || !dirtyRows.length}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save{dirtyRows.length ? ` ${dirtyRows.length} change${dirtyRows.length === 1 ? "" : "s"}` : ""}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: "entry", label: "Mark Entry", icon: ClipboardList },
          { id: "cards", label: "Report Cards", icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
              view === item.id
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {view === "cards" ? (
        <ReportCards terms={terms} subjects={subjects} />
      ) : (
        <div className="space-y-6">

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-card p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-2 block font-semibold text-slate-700">Exam term</span>
            <select
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 dark:bg-transparent"
            >
              {!terms.length && <option value="">No terms yet</option>}
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name} · {term.academicYear}
                  {term.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-2 block font-semibold text-slate-700">My subject</span>
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 dark:bg-transparent"
            >
              {!subjects.length && <option value="">No subjects assigned</option>}
              {subjects.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.className} — {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="block text-sm">
            <span className="mb-2 block font-semibold text-slate-700">Search student</span>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 outline-none focus:border-emerald-500 dark:bg-transparent"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-transparent">
            {subject ? (
              <>
                <span className="font-semibold text-slate-700">
                  {subject.name}
                </span>{" "}
                is out of {subject.fullMarks} ({subject.theoryFull} theory + {subject.practicalFull}{" "}
                practical). Pass mark {subject.passMarks}. {sheet?.className}.
              </>
            ) : (
              "Pick a term and a subject to start entering marks."
            )}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300"
          >
            <AlertCircle size={16} /> {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} /> {message}
          </p>
        )}

        {publishedLock && (
          <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:text-amber-300">
            <Lock size={16} />
            This class has been published for {sheet?.term?.name}. Marks are locked until the office
            reopens the term.
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <ClipboardList size={18} className="text-emerald-600 dark:text-emerald-400" />
              {subject ? `${subject.name} — ${sheet?.className}` : "Mark sheet"}
            </h2>

            <p className="text-sm text-slate-500">
              {drafts.length
                ? `${enteredCount} of ${drafts.length} entered`
                : "No students in this class yet"}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading the mark sheet…
            </div>
          ) : !drafts.length ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-4">
                <User size={26} className="text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700">Nothing to mark</h3>
              <p className="mt-1 text-sm text-slate-500">
                Ask the office to add students to this class and subjects to your name.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-3 py-3">
                      Theory
                      <span className="ml-1 font-normal normal-case text-slate-400">
                        /{subject?.theoryFull}
                      </span>
                    </th>
                    <th className="px-3 py-3">
                      Practical
                      <span className="ml-1 font-normal normal-case text-slate-400">
                        /{subject?.practicalFull}
                      </span>
                    </th>
                    <th className="px-3 py-3">Absent</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Grade</th>
                    <th className="px-3 py-3">Remarks</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => {
                    const result = preview(row);
                    const issue = issuesOf(row);
                    const saved = savedById.get(row.student) || BLANK_ROW;
                    const isPublished = row.published;

                    // A cell the teacher has changed but not saved yet, and a cell
                    // holding something the paper cannot score, read differently.
                    const markClass = (field, problem) =>
                      `w-20 rounded-lg border bg-slate-50 px-2 py-2 text-center outline-none focus:border-emerald-500 disabled:opacity-40 dark:bg-transparent ${
                        problem
                          ? "border-red-400 ring-2 ring-red-100 dark:ring-red-500/20"
                          : row[field] !== saved[field]
                            ? "border-emerald-400"
                            : "border-slate-200"
                      }`;

                    return (
                      <tr key={row.student} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:text-emerald-400">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {row.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {row.studentId}
                                {row.rollNumber ? ` · Roll ${row.rollNumber}` : ""}
                              </p>
                            </div>
                            {isPublished && (
                              <Lock size={14} className="text-amber-500" aria-label="Published" />
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max={subject?.theoryFull}
                            disabled={row.absent || isPublished}
                            value={row.theory}
                            title={issue.theory || undefined}
                            onChange={(event) => edit(row.student, "theory", event.target.value)}
                            className={markClass("theory", issue.theory)}
                          />
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max={subject?.practicalFull}
                            disabled={row.absent || isPublished}
                            value={row.practical}
                            title={issue.practical || undefined}
                            onChange={(event) => edit(row.student, "practical", event.target.value)}
                            className={markClass("practical", issue.practical)}
                          />
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={row.absent}
                            onChange={(event) =>
                              setDrafts((current) =>
                                current.map((entry) =>
                                  entry.student === row.student
                                    ? {
                                        ...entry,
                                        absent: event.target.checked,
                                        theory: event.target.checked ? "" : entry.theory,
                                        practical: event.target.checked ? "" : entry.practical,
                                      }
                                    : entry
                                )
                              )
                            }
                            className="h-5 w-5 cursor-pointer accent-emerald-600"
                          />
                        </td>

                        <td className="px-3 py-3 font-semibold text-slate-800">
                          {result ? `${result.total}` : "—"}
                        </td>

                        <td className="px-3 py-3">
                          {result ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${gradeTone(result.grade)}`}
                            >
                              {result.grade}
                              {result.gradePoint !== null && result.grade !== "Ab"
                                ? ` · ${result.gradePoint.toFixed(1)}`
                                : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">not entered</span>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <input
                            value={row.remarks}
                            disabled={isPublished}
                            onChange={(event) => edit(row.student, "remarks", event.target.value)}
                            placeholder="Optional"
                            className="w-40 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-emerald-500 dark:bg-transparent"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hasIssues && (
            <p className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700 dark:text-red-300">
              Some marks are outside what the paper is worth. Fix the red cells before saving.
            </p>
          )}
        </div>
        </div>
      )}
    </div>
  );
}

const STATUS_TONE = {
  published: "bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:text-amber-300",
  empty: "bg-slate-100 text-slate-500",
};

// A teacher prints cards for the forms they teach. Cards are fetched once per
// student and kept, so reprinting the class does not go back to the server.
function ReportCards({ terms, subjects }) {
  const { school, user } = useAuth();

  const classes = useMemo(() => {
    const names = new Set([
      ...(user?.assignedClasses || []),
      ...subjects.map((subject) => subject.className),
    ]);

    return [...names].filter(Boolean).sort();
  }, [subjects, user]);

  const [termId, setTermId] = useState("");
  const [className, setClassName] = useState("");
  const [roster, setRoster] = useState(null);
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!terms.length) return;

    setTermId((current) =>
      current && terms.some((term) => term._id === current)
        ? current
        : terms.find((term) => !term.archived)?._id || terms[0]._id
    );
  }, [terms]);

  useEffect(() => {
    if (!classes.length) return;

    setClassName((current) => (classes.includes(current) ? current : classes[0]));
  }, [classes]);

  useEffect(() => {
    if (!termId || !className) {
      setRoster(null);
      return;
    }

    let cancelled = false;

    const loadRoster = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/results/class", { params: { term: termId, className } });

        if (!cancelled) setRoster(res.data);
      } catch (err) {
        if (cancelled) return;

        setRoster(null);
        setError(err?.response?.data?.message || "Unable to load this class.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoster();

    return () => {
      cancelled = true;
    };
  }, [termId, className]);

  const cardOf = async (row) => {
    if (cards[row.resultId]) return cards[row.resultId];

    const res = await api.get(`/results/${row.resultId}`);

    setCards((current) => ({ ...current, [row.resultId]: res.data }));

    return res.data;
  };

  const generate = async (row, kind) => {
    if (!row.resultId) {
      setError(`${row.name} has no mark sheet for this term yet.`);
      return;
    }

    setBusy(row.resultId);
    setError("");

    try {
      const card = await cardOf(row);

      if (kind === "print") printReportCard({ school, result: card });
      else downloadReportCard({ school, result: card });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to open this card.");
    } finally {
      setBusy("");
    }
  };

  const term = terms.find((item) => item._id === termId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-card p-5 shadow-sm md:grid-cols-2 xl:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-2 block font-semibold text-slate-700">Exam term</span>
          <select
            value={termId}
            onChange={(event) => setTermId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 dark:bg-transparent"
          >
            {!terms.length && <option value="">No terms yet</option>}
            {terms.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} · {item.academicYear}
                {item.archived ? " (archived)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block font-semibold text-slate-700">Class</span>
          <select
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 dark:bg-transparent"
          >
            {!classes.length && <option value="">No classes assigned</option>}
            {classes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-transparent">
          {roster?.summary
            ? `${roster.summary.published} of ${roster.summary.students} cards in ${className} are published for ${term?.name || "this term"}.`
            : "Pick a class to list its students and print their cards."}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <AlertCircle size={16} /> {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
            {className || "Class roster"} — {term?.name || "term"}
          </h2>
          <p className="text-sm text-slate-500">
            {roster?.students?.length || 0} students
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading the roster…
          </div>
        ) : !roster || !roster.students.length ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-4">
              <User size={26} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700">No students to print for</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              This class has no enrolled students, or you are not assigned to it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-3 py-3">Card</th>
                  <th className="px-3 py-3">GPA</th>
                  <th className="px-3 py-3">Obtained</th>
                  <th className="px-3 py-3">Result</th>
                  <th className="px-3 py-3 text-right">Generate</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {roster.students.map((row) => (
                  <tr key={row.student} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{row.name}</p>
                      <p className="text-xs text-slate-500">
                        {row.studentId}
                        {row.rollNumber ? ` · Roll ${row.rollNumber}` : ""}
                      </p>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                          STATUS_TONE[row.status] || STATUS_TONE.empty
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-slate-700">
                      {row.gpa ?? "—"}
                    </td>

                    <td className="px-3 py-3 text-slate-700">
                      {row.obtained === null || row.obtained === undefined
                        ? "—"
                        : `${row.obtained}/${row.maximum}`}
                    </td>

                    <td className="px-3 py-3">
                      {row.result === "fail" ? (
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">FAIL</span>
                      ) : row.result === "pass" ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          PASS
                        </span>
                      ) : (
                        <span className="text-xs uppercase text-slate-400">{row.result}</span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {busy === row.resultId && (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        )}

                        <button
                          type="button"
                          onClick={() => generate(row, "print")}
                          disabled={!row.resultId || Boolean(busy)}
                          title={`Print ${row.name}`}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Printer size={15} /> Print
                        </button>

                        <button
                          type="button"
                          onClick={() => generate(row, "pdf")}
                          disabled={!row.resultId || Boolean(busy)}
                          title={`Download ${row.name}`}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Download size={15} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="border-t border-slate-100 px-5 py-3 text-xs leading-5 text-slate-400">
          Print opens the card in its own window, PDF saves an A4 copy. A card the office has not
          published prints marked as a draft proof — families can only download published results.
        </p>
      </div>
    </div>
  );
}
