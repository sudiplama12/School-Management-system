import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { downloadReportCard, printReportCard } from "../../utils/reportCard";

const KINDS = [
  { value: "terminal", label: "Terminal" },
  { value: "half", label: "Half" },
  { value: "final", label: "Final" },
  { value: "assessment", label: "Assessment" },
];

const RESULT_TONES = {
  pass: "bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  fail: "bg-red-50 text-red-700 dark:text-red-300",
  absent: "bg-amber-50 text-amber-700 dark:text-amber-300",
  pending: "bg-slate-100 text-slate-600 dark:text-slate-300",
};

const emptySubject = {
  name: "",
  code: "",
  className: "",
  theoryFull: 70,
  practicalFull: 30,
  passMarks: "",
  credits: 4,
  teacher: "",
  active: true,
};

const emptyTerm = {
  name: "",
  academicYear: "",
  kind: "terminal",
  startDate: "",
  endDate: "",
  venue: "",
  archived: false,
};

const toDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatDate = (value) => toDateInput(value) || "—";

function Tile({ label, value, hint, tone = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// The page wrapper is transformed, so a fixed overlay rendered inside it would
// size to the content column instead of the viewport.
function Modal({ title, subtitle, onClose, wide, children }) {
  return createPortal(
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="qd-fade-in fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <div
        className={`qd-scale-in my-auto w-full rounded-2xl bg-card p-6 shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-transparent";

function Label({ text, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold text-slate-700 dark:text-slate-300">{text}</span>
      {children}
    </label>
  );
}

export default function AdminResults() {
  const { school } = useAuth();
  const [tab, setTab] = useState("subjects");

  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [className, setClassName] = useState("");
  const [termId, setTermId] = useState("");
  const [reviewClassName, setReviewClassName] = useState("");

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [subjectForm, setSubjectForm] = useState(null);
  const [termForm, setTermForm] = useState(null);
  const [cardRow, setCardRow] = useState(null);
  const [card, setCard] = useState(null);
  const [remarks, setRemarks] = useState("");

  const loadBase = async () => {
    setLoading(true);
    setError("");

    try {
      const [subjectRes, termRes, studentRes, teacherRes] = await Promise.all([
        api.get("/results/subjects"),
        api.get("/results/terms"),
        api.get("/admin/students"),
        api.get("/admin/users", { params: { role: "teacher" } }),
      ]);

      setSubjects(subjectRes.data || []);
      setTerms(termRes.data || []);
      setStudents(studentRes.data || []);
      setTeachers(
        (teacherRes.data || []).filter((teacher) => teacher.status !== "inactive")
      );

      setClassName((current) => current || subjectRes.data?.[0]?.className || "");
      setReviewClassName((current) => current || studentRes.data?.[0]?.className || "");
      setTermId((current) => current || termRes.data?.[0]?._id || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load the results data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBase();
  }, []);

  const classes = useMemo(() => {
    const names = new Set([
      ...subjects.map((subject) => subject.className),
      ...students.map((student) => student.className),
      ...(className ? [className] : []),
    ]);

    return [...names].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [subjects, students, className]);

  const visibleSubjects = useMemo(
    () =>
      subjects
        .filter((subject) => !className || subject.className === className)
        .filter((subject) => {
          const needle = search.trim().toLowerCase();

          return !needle || `${subject.name} ${subject.code}`.toLowerCase().includes(needle);
        }),
    [subjects, className, search]
  );

  const reviewClass = reviewClassName || classes[0] || "";

  const loadReview = async (term = termId, name = reviewClass) => {
    if (!term || !name) {
      setReview(null);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res = await api.get("/results/class", {
        params: { term, className: name },
      });

      setReview(res.data);
    } catch (err) {
      setReview(null);
      setError(err?.response?.data?.message || "Unable to load this class.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (tab === "results") loadReview(termId, reviewClass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, termId, reviewClass]);

  const notify = (text, tone = "ok") => {
    if (tone === "error") {
      setError(text);
      setMessage("");
      return;
    }

    setMessage(text);
    setError("");
  };

  // ---------------------------------------------------------------- subjects

  const saveSubject = async (event) => {
    event.preventDefault();

    const form = subjectForm.form;
    const body = {
      name: form.name.trim(),
      code: form.code.trim(),
      className: form.className.trim(),
      theoryFull: Number(form.theoryFull || 0),
      practicalFull: Number(form.practicalFull || 0),
      credits: Number(form.credits || 0),
      teacher: form.teacher || null,
      active: form.active,
      passMarks: form.passMarks === "" ? null : Number(form.passMarks),
    };

    if (!body.name || !body.className) {
      notify("Subject name and class are required.", "error");
      return;
    }
    if (body.theoryFull + body.practicalFull <= 0) {
      notify("Full marks must add up to more than zero.", "error");
      return;
    }

    setBusy(true);

    try {
      if (subjectForm.id) {
        await api.patch(`/results/subjects/${subjectForm.id}`, body);
        notify(`${body.name} updated.`);
      } else {
        await api.post("/results/subjects", body);
        notify(`${body.name} added to ${body.className}.`);
      }

      setSubjectForm(null);
      const res = await api.get("/results/subjects");

      setSubjects(res.data || []);
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to save this subject.", "error");
    } finally {
      setBusy(false);
    }
  };

  const removeSubject = async (subject) => {
    if (!window.confirm(`Remove ${subject.name} from ${subject.className}?`)) return;

    try {
      await api.delete(`/results/subjects/${subject._id}`);
      notify(`${subject.name} was removed.`);

      const res = await api.get("/results/subjects");

      setSubjects(res.data || []);
    } catch (err) {
      const text = err?.response?.data?.message || "Unable to remove this subject.";

      // The API refuses when marks already exist; the office can override.
      if (err?.response?.status === 400 && window.confirm(`${text} Remove it anyway?`)) {
        await api.delete(`/results/subjects/${subject._id}?force=1`);
        notify(`${subject.name} was removed.`);
        const res = await api.get("/results/subjects");

        setSubjects(res.data || []);
        return;
      }

      notify(text, "error");
    }
  };

  // ------------------------------------------------------------------- terms

  const saveTerm = async (event) => {
    event.preventDefault();

    const form = termForm.form;

    if (!form.name.trim() || !form.academicYear.trim()) {
      notify("Term name and academic year are required.", "error");
      return;
    }

    setBusy(true);

    const body = {
      name: form.name.trim(),
      academicYear: form.academicYear.trim(),
      kind: form.kind,
      venue: form.venue.trim(),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      archived: form.archived,
    };

    try {
      if (termForm.id) {
        await api.patch(`/results/terms/${termForm.id}`, body);
        notify(`${body.name} updated.`);
      } else {
        await api.post("/results/terms", body);
        notify(`${body.name} created.`);
      }

      setTermForm(null);
      const res = await api.get("/results/terms");

      setTerms(res.data || []);
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to save this term.", "error");
    } finally {
      setBusy(false);
    }
  };

  const removeTerm = async (term) => {
    if (
      !window.confirm(
        `Delete ${term.name} (${term.academicYear}) and every mark sheet entered for it?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/results/terms/${term._id}`);
      notify(`${term.name} deleted.`);

      const res = await api.get("/results/terms");

      setTerms(res.data || []);
      if (term._id === termId) setTermId(res.data?.[0]?._id || "");
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to delete this term.", "error");
    }
  };

  // --------------------------------------------------------------- publishing

  const publish = async (force = false) => {
    setBusy(true);

    try {
      const res = await api.post("/results/publish", {
        term: termId,
        className: reviewClass,
        force,
      });

      notify(res.data?.message || "Results published.");
      await loadBase();
      await loadReview(termId, reviewClass);
    } catch (err) {
      const text = err?.response?.data?.message || "Unable to publish this class.";

      if (err?.response?.status === 400 && window.confirm(`${text} Publish anyway?`)) {
        await publish(true);
        return;
      }

      notify(text, "error");
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    if (!window.confirm("Reopen this class so teachers can edit marks again?")) return;

    setBusy(true);

    try {
      const res = await api.post("/results/unpublish", { term: termId, className: reviewClass });

      notify(res.data?.message || "Class reopened.");
      await loadReview(termId, reviewClass);
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to reopen this class.", "error");
    } finally {
      setBusy(false);
    }
  };

  const openCard = async (row) => {
    if (!row.resultId) {
      notify("No mark sheet exists for this student yet.", "error");
      return;
    }

    setCardRow(row);
    setRemarks("");
    setCard({ loading: true });

    try {
      const res = await api.get(`/results/${row.resultId}`);

      setCard(res.data);
      setRemarks(res.data?.officeRemarks || "");
    } catch (err) {
      // Drafts are not printable yet, but the office still wants to see them.
      setCard({ draft: true, row });
      notify(err?.response?.data?.message || "This card is not published.", "error");
    }
  };

  const saveRemarks = async () => {
    setBusy(true);

    try {
      await api.patch(`/results/${cardRow.resultId}`, { officeRemarks: remarks });
      notify("Office remarks saved.");
      setCard((current) => ({ ...current, officeRemarks: remarks }));
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to save the remarks.", "error");
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "terms", label: "Exam terms", icon: CalendarDays },
    { id: "results", label: "Review & publish", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            SMART SCHOOL MANAGEMENT SYSTEM
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <GraduationCap size={26} className="text-emerald-600 dark:text-emerald-400" />
            Result Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep the subject catalogue and exam calendar, review what teachers have entered and
            release results to families.
          </p>
        </div>

        <div className="flex gap-2">
          {tab === "subjects" && (
            <button
              onClick={() =>
                setSubjectForm({
                  id: null,
                  form: { ...emptySubject, className: className || classes[0] || "" },
                })
              }
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={18} /> New subject
            </button>
          )}

          {tab === "terms" && (
            <button
              onClick={() => setTermForm({ id: null, form: { ...emptyTerm } })}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={18} /> New term
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
              tab === item.id
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {message && !error && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 size={16} /> {message}
        </p>
      )}

      {tab === "subjects" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Label text="Class">
              <select
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className={inputClass}
              >
                <option value="">All classes</option>
                {classes.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Label>

            <div className="relative min-w-[220px] flex-1 self-end">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subjects…"
                className={inputClass}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-4 py-4">Class</th>
                  <th className="px-4 py-4">Theory</th>
                  <th className="px-4 py-4">Practical</th>
                  <th className="px-4 py-4">Full</th>
                  <th className="px-4 py-4">Pass</th>
                  <th className="px-4 py-4">Credits</th>
                  <th className="px-4 py-4">Teacher</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                      <Loader2 size={18} className="mr-2 inline animate-spin" />
                      Loading the catalogue…
                    </td>
                  </tr>
                ) : !visibleSubjects.length ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-500">
                      No subjects yet. Add the papers this school runs so teachers get a mark sheet.
                    </td>
                  </tr>
                ) : (
                  visibleSubjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {subject.name}
                        </p>
                        {subject.code && (
                          <p className="text-xs text-slate-400">{subject.code}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{subject.className}</td>
                      <td className="px-4 py-3 text-slate-600">{subject.theoryFull}</td>
                      <td className="px-4 py-3 text-slate-600">{subject.practicalFull}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {subject.fullMarks}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{subject.passMarks}</td>
                      <td className="px-4 py-3 text-slate-600">{subject.credits}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {subject.teacher?.name || (
                          <span className="text-slate-400">unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            subject.active
                              ? "bg-emerald-50 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {subject.active ? "Active" : "Retired"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setSubjectForm({
                                id: subject._id,
                                form: {
                                  name: subject.name,
                                  code: subject.code || "",
                                  className: subject.className,
                                  theoryFull: subject.theoryFull,
                                  practicalFull: subject.practicalFull,
                                  passMarks: subject.passMarks ?? "",
                                  credits: subject.credits,
                                  teacher: subject.teacher?._id || "",
                                  active: subject.active,
                                },
                              })
                            }
                            aria-label={`Edit ${subject.name}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => removeSubject(subject)}
                            aria-label={`Delete ${subject.name}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500">
            An unassigned subject can be marked by any teacher of that class, which lets the office
            enter marks before ownership is settled.
          </p>
        </div>
      )}

      {tab === "terms" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Term</th>
                <th className="px-4 py-4">Year</th>
                <th className="px-4 py-4">Kind</th>
                <th className="px-4 py-4">Dates</th>
                <th className="px-4 py-4">Venue</th>
                <th className="px-4 py-4">Sheets</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 size={18} className="mr-2 inline animate-spin" />
                    Loading terms…
                  </td>
                </tr>
              ) : !terms.length ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    No exam terms yet. Create one so teachers have something to mark against.
                  </td>
                </tr>
              ) : (
                terms.map((term) => (
                  <tr key={term._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {term.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{term.academicYear}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{term.kind}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {term.startDate ? `${formatDate(term.startDate)} → ${formatDate(term.endDate)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{term.venue || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {term.published} published · {term.draft} draft
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          term.archived
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-50 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {term.archived ? <Lock size={12} /> : <Unlock size={12} />}
                        {term.archived ? "Archived" : "Open"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setTermForm({
                              id: term._id,
                              form: {
                                name: term.name,
                                academicYear: term.academicYear,
                                kind: term.kind,
                                startDate: toDateInput(term.startDate),
                                endDate: toDateInput(term.endDate),
                                venue: term.venue || "",
                                archived: Boolean(term.archived),
                              },
                            })
                          }
                          aria-label={`Edit ${term.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => removeTerm(term)}
                          aria-label={`Delete ${term.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Label text="Exam term">
              <select
                value={termId}
                onChange={(event) => setTermId(event.target.value)}
                className={inputClass}
              >
                {!terms.length && <option value="">No terms yet</option>}
                {terms.map((term) => (
                  <option key={term._id} value={term._id}>
                    {term.name} · {term.academicYear}
                  </option>
                ))}
              </select>
            </Label>

            <Label text="Class">
              <select
                value={reviewClass}
                onChange={(event) => setReviewClassName(event.target.value)}
                className={inputClass}
              >
                {!classes.length && <option value="">No classes yet</option>}
                {classes.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Label>

            <div className="flex items-end gap-2">
              <button
                onClick={() => publish(false)}
                disabled={busy || !review?.students?.length}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <BadgeCheck size={18} /> Publish class
              </button>
              <button
                onClick={unpublish}
                disabled={busy || !review?.students?.some((row) => row.status === "published")}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={18} /> Reopen
              </button>
            </div>
          </div>

          {busy && !review && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading this class…
            </p>
          )}

          {review && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Tile label="Students" value={review.summary.students} hint={review.className} />
                <Tile
                  label="Mark sheets"
                  value={review.summary.sheets}
                  hint={`${review.summary.drafts} still draft`}
                />
                <Tile
                  label="Published"
                  value={review.summary.published}
                  tone={review.summary.published ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900"}
                  hint={review.summary.published ? "families can print" : "nothing released"}
                />
                <Tile
                  label="Papers"
                  value={`${review.progress.filter((row) => row.complete).length}/${review.progress.length}`}
                  tone={review.summary.complete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}
                  hint={review.summary.complete ? "all entered" : "still waiting on marks"}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-card p-5">
                <h2 className="text-sm font-semibold text-slate-900">Entry progress</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {review.progress.map((row) => (
                    <div
                      key={row.subject}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:bg-transparent"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {row.subjectName}
                        </p>
                        <span
                          className={`text-xs font-bold ${
                            row.complete
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {row.entered}/{row.expected}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.teacherName || "any teacher of the class"} · out of {row.fullMarks}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${row.expected ? (row.entered / row.expected) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Student</th>
                      {review.subjects.map((subject) => (
                        <th key={subject._id} className="px-3 py-4">
                          {subject.name}
                          <span className="ml-1 font-normal normal-case text-slate-400">
                            /{subject.fullMarks}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-4">Total</th>
                      <th className="px-3 py-4">GPA</th>
                      <th className="px-3 py-4">Division</th>
                      <th className="px-3 py-4">Result</th>
                      <th className="px-3 py-4 text-right">Card</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {review.students.map((row) => (
                      <tr key={row.student} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {row.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {row.studentId}
                            {row.rollNumber ? ` · Roll ${row.rollNumber}` : ""}
                          </p>
                        </td>

                        {review.subjects.map((subject) => {
                          const cell = row.subjects.find(
                            (entry) => String(entry.subject) === String(subject._id)
                          );

                          return (
                            <td key={subject._id} className="px-3 py-3 text-slate-700 dark:text-slate-300">
                              {cell ? (
                                <span className="flex items-center gap-1.5">
                                  {cell.absent ? "Ab" : cell.total}
                                  <span className="text-xs text-slate-400">{cell.grade}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {row.obtained !== null ? `${row.obtained}/${row.maximum}` : "—"}
                        </td>
                        <td className="px-3 py-3">{row.gpa ?? "—"}</td>
                        <td className="px-3 py-3">{row.division || "—"}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              RESULT_TONES[row.result] || RESULT_TONES.pending
                            }`}
                          >
                            {row.result}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => openCard(row)}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              <FileText size={14} />
                              {row.status === "published" ? "View" : "Draft"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {subjectForm && (
        <Modal
          title={subjectForm.id ? "Edit subject" : "New subject"}
          subtitle="The marks scheme is copied onto every card at entry, so changing it later never rewrites a printed result."
          onClose={() => setSubjectForm(null)}
        >
          <form onSubmit={saveSubject} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Label text="Subject name">
                <input
                  value={subjectForm.form.name}
                  onChange={(event) =>
                    setSubjectForm((f) => ({ ...f, form: { ...f.form, name: event.target.value } }))
                  }
                  placeholder="Mathematics"
                  className={inputClass}
                  autoFocus
                />
              </Label>
              <Label text="Class">
                <input
                  list="result-classes"
                  value={subjectForm.form.className}
                  onChange={(event) =>
                    setSubjectForm((f) => ({
                      ...f,
                      form: { ...f.form, className: event.target.value },
                    }))
                  }
                  placeholder="Grade 10"
                  className={inputClass}
                />
                <datalist id="result-classes">
                  {classes.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Label>
              <Label text="Subject code">
                <input
                  value={subjectForm.form.code}
                  onChange={(event) =>
                    setSubjectForm((f) => ({ ...f, form: { ...f.form, code: event.target.value } }))
                  }
                  placeholder="MTH10"
                  className={inputClass}
                />
              </Label>
              <Label text="Owning teacher">
                <select
                  value={subjectForm.form.teacher}
                  onChange={(event) =>
                    setSubjectForm((f) => ({
                      ...f,
                      form: { ...f.form, teacher: event.target.value },
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Any teacher of the class</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="Theory full marks">
                <input
                  type="number"
                  min="0"
                  value={subjectForm.form.theoryFull}
                  onChange={(event) =>
                    setSubjectForm((f) => ({
                      ...f,
                      form: { ...f.form, theoryFull: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </Label>
              <Label text="Practical full marks">
                <input
                  type="number"
                  min="0"
                  value={subjectForm.form.practicalFull}
                  onChange={(event) =>
                    setSubjectForm((f) => ({
                      ...f,
                      form: { ...f.form, practicalFull: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </Label>
              <Label text="Pass marks">
                <input
                  type="number"
                  min="0"
                  value={subjectForm.form.passMarks}
                  onChange={(event) =>
                    setSubjectForm((f) => ({
                      ...f,
                      form: { ...f.form, passMarks: event.target.value },
                    }))
                  }
                  placeholder="35% of the total"
                  className={inputClass}
                />
              </Label>
              <Label text="Credits">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={subjectForm.form.credits}
                  onChange={(event) =>
                    setSubjectForm((f) => ({
                      ...f,
                      form: { ...f.form, credits: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </Label>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={subjectForm.form.active}
                onChange={(event) =>
                  setSubjectForm((f) => ({
                    ...f,
                    form: { ...f.form, active: event.target.checked },
                  }))
                }
                className="h-4 w-4 accent-emerald-600"
              />
              Active in the current catalogue
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubjectForm(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                Save subject
              </button>
            </div>
          </form>
        </Modal>
      )}

      {termForm && (
        <Modal
          title={termForm.id ? "Edit exam term" : "New exam term"}
          subtitle="Attendance shown on the card is counted between these dates."
          onClose={() => setTermForm(null)}
        >
          <form onSubmit={saveTerm} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Label text="Term name">
                <input
                  value={termForm.form.name}
                  onChange={(event) =>
                    setTermForm((f) => ({ ...f, form: { ...f.form, name: event.target.value } }))
                  }
                  placeholder="First Terminal"
                  className={inputClass}
                  autoFocus
                />
              </Label>
              <Label text="Academic year">
                <input
                  value={termForm.form.academicYear}
                  onChange={(event) =>
                    setTermForm((f) => ({
                      ...f,
                      form: { ...f.form, academicYear: event.target.value },
                    }))
                  }
                  placeholder="2026"
                  className={inputClass}
                />
              </Label>
              <Label text="Kind">
                <select
                  value={termForm.form.kind}
                  onChange={(event) =>
                    setTermForm((f) => ({ ...f, form: { ...f.form, kind: event.target.value } }))
                  }
                  className={inputClass}
                >
                  {KINDS.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="Exam venue">
                <input
                  value={termForm.form.venue}
                  onChange={(event) =>
                    setTermForm((f) => ({ ...f, form: { ...f.form, venue: event.target.value } }))
                  }
                  placeholder="Main hall"
                  className={inputClass}
                />
              </Label>
              <Label text="Starts">
                <input
                  type="date"
                  value={termForm.form.startDate}
                  onChange={(event) =>
                    setTermForm((f) => ({
                      ...f,
                      form: { ...f.form, startDate: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </Label>
              <Label text="Ends">
                <input
                  type="date"
                  value={termForm.form.endDate}
                  onChange={(event) =>
                    setTermForm((f) => ({
                      ...f,
                      form: { ...f.form, endDate: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </Label>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={termForm.form.archived}
                onChange={(event) =>
                  setTermForm((f) => ({
                    ...f,
                    form: { ...f.form, archived: event.target.checked },
                  }))
                }
                className="h-4 w-4 accent-emerald-600"
              />
              Archive this term (no further marks)
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTermForm(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                Save term
              </button>
            </div>
          </form>
        </Modal>
      )}

      {cardRow && (
        <Modal
          wide
          title={`${cardRow.name} — ${cardRow.studentId}`}
          subtitle={`${reviewClass} · ${terms.find((term) => term._id === termId)?.name || ""}`}
          onClose={() => {
            setCardRow(null);
            setCard(null);
          }}
        >
          {card?.loading ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Opening the card…
            </p>
          ) : card?.draft ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:text-amber-300">
              This sheet is still a draft. Publish the class before it can be printed or sent to the
              family.
            </p>
          ) : card ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <Tile label="Obtained" value={`${card.obtained}/${card.maximum}`} />
                <Tile label="GPA" value={card.gpa} />
                <Tile label="Division" value={card.division || "—"} />
                <Tile
                  label="Result"
                  value={String(card.result || "pending").toUpperCase()}
                  tone={
                    card.result === "fail"
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-3 py-3">Theory</th>
                      <th className="px-3 py-3">Practical</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Grade</th>
                      <th className="px-3 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {card.subjects.map((row) => (
                      <tr key={row.subject}>
                        <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                          {row.subjectName}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {row.absent ? "Ab" : `${row.theory ?? "-"} / ${row.theoryFull}`}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {row.absent ? "Ab" : `${row.practical ?? "-"} / ${row.practicalFull}`}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                          {row.absent ? "Ab" : row.total}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {row.grade} {row.gradePoint ? `· ${row.gradePoint}` : ""}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{row.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Label text="Office remarks printed on the card">
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={3}
                  placeholder="Conduct, promotion note, or anything the family should read."
                  className={inputClass}
                />
              </Label>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={saveRemarks}
                  disabled={busy}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Save remarks
                </button>
                <button
                  onClick={() => printReportCard({ school, result: card })}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Printer size={16} /> Print
                </button>
                <button
                  onClick={() =>
                    downloadReportCard({ school, result: card })
                  }
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}
