import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  IdCard,
  KeyRound,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import api, { apiMessage } from "../../api/axios";
import ResetPasswordDialog from "../../components/Admin/ResetPasswordDialog";

// The staff register. Everything the office needs to keep a teacher's record —
// who they are, what they teach, when they joined and whether the account is
// live — is on one screen, searchable and sortable without a round trip.

const emptyForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  teacherId: "",
  subject: "",
  qualification: "",
  designation: "",
  experienceYears: "",
  joinedAt: "",
  status: "active",
  phone: "",
  address: "",
  gender: "",
  assignedClasses: "",
};

const AVATAR_TONES = [
  "from-emerald-600 to-teal-700",
  "from-amber-600 to-orange-700",
  "from-sky-600 to-blue-700",
  "from-rose-600 to-pink-700",
  "from-violet-600 to-purple-700",
  "from-teal-600 to-cyan-700",
];

const toneFor = (seed = "") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "T";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

// Date inputs need the local calendar day, never the UTC slice of toISOString.
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

const tenure = (value) => {
  if (!value) return null;

  const joined = new Date(value);

  if (Number.isNaN(joined.getTime())) return null;

  const months = Math.max(
    0,
    (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  const years = Math.floor(months / 12);
  const rest = Math.floor(months % 12);

  if (years && rest) return `${years} yr ${rest} mo`;
  if (years) return `${years} yr`;
  if (rest) return `${rest} mo`;

  return "Less than a month";
};

const toList = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const cap = (value) =>
  value ? value[0].toUpperCase() + value.slice(1) : "—";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("name");
  const [view, setView] = useState("grid");

  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);
  const [reset, setReset] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/users", {
        params: { role: "teacher" },
      });

      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiMessage(err, "Unable to load teachers."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!detail && !editor) return undefined;

    const close = (event) => {
      // The reset dialog is stacked over the drawer and handles Escape itself;
      // otherwise one keypress would close both.
      if (event.key === "Escape" && !reset) {
        setDetail(null);
        setEditor(null);
      }
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [detail, editor, reset]);

  const subjects = useMemo(
    () =>
      [...new Set(teachers.map((t) => t.subject).filter(Boolean))].sort(),
    [teachers]
  );

  const classesCovered = useMemo(
    () => new Set(teachers.flatMap((t) => t.assignedClasses || [])),
    [teachers]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const rows = teachers.filter((teacher) => {
      if (status !== "all" && (teacher.status || "active") !== status) {
        return false;
      }

      if (subject !== "all" && teacher.subject !== subject) return false;

      if (!term) return true;

      return [
        teacher.name,
        teacher.email,
        teacher.username,
        teacher.teacherId,
        teacher.subject,
        teacher.designation,
        teacher.phone,
        ...(teacher.assignedClasses || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });

    const byJoined = (a, b) =>
      new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);

    if (sort === "joined-new") rows.sort(byJoined);
    else if (sort === "joined-old") rows.sort((a, b) => byJoined(b, a));
    else if (sort === "experience")
      rows.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    else rows.sort((a, b) => a.name.localeCompare(b.name));

    return rows;
  }, [teachers, search, status, subject, sort]);

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setEditor("add");
  }

  function openEdit(teacher) {
    setForm({
      ...emptyForm,
      name: teacher.name || "",
      email: teacher.email || "",
      username: teacher.username || "",
      teacherId: teacher.teacherId || "",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "",
      designation: teacher.designation || "",
      experienceYears: teacher.experienceYears ?? "",
      joinedAt: toDateInput(teacher.joinedAt),
      status: teacher.status || "active",
      phone: teacher.phone || "",
      address: teacher.address || "",
      gender: teacher.gender || "",
      assignedClasses: (teacher.assignedClasses || []).join(", "),
    });

    setError("");
    setDetail(null);
    setEditor(teacher);
  }

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // Deliberately does not close the detail drawer: the dialog stacks over it so
  // the office can see whose record they are working on.
  function openReset(teacher) {
    setError("");
    setMessage("");
    setReset(teacher);
  }

  async function save(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    if (!editor || editor === "add") {
      if (form.password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }
    } else if (form.password && form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const payload = {
      name,
      email,
      username: form.username.trim() || email.toLowerCase(),
      teacherId: form.teacherId.trim(),
      subject: form.subject.trim(),
      qualification: form.qualification.trim(),
      designation: form.designation.trim(),
      experienceYears: form.experienceYears === "" ? undefined : form.experienceYears,
      joinedAt: form.joinedAt || undefined,
      status: form.status,
      phone: form.phone.trim(),
      address: form.address.trim(),
      gender: form.gender || undefined,
      assignedClasses: toList(form.assignedClasses),
    };

    if (form.password) payload.password = form.password;

    setSaving(true);
    setError("");

    try {
      if (editor && editor !== "add") {
        await api.patch(`/admin/users/${editor._id}`, payload);
      } else {
        await api.post("/admin/users", { ...payload, role: "teacher" });
      }

      setEditor(null);
      setMessage(
        editor && editor !== "add"
          ? `${name}'s record was updated.`
          : `${name} was added to the staff register.`
      );
      await load();
    } catch (err) {
      setError(apiMessage(err, "Unable to save this teacher."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(teacher) {
    const next = teacher.status === "active" ? "inactive" : "active";

    setError("");

    try {
      await api.patch(`/admin/users/${teacher._id}`, { status: next });
      setMessage(`${teacher.name} is now ${next}.`);
      await load();
      setDetail((current) =>
        current && current._id === teacher._id
          ? { ...current, status: next }
          : current
      );
    } catch (err) {
      setError(apiMessage(err, "Unable to update the status."));
    }
  }

  async function remove(teacher) {
    if (!window.confirm(`Delete ${teacher.name}'s account?`)) return;

    setError("");

    try {
      await api.delete(`/admin/users/${teacher._id}`);
      setDetail(null);
      setMessage(`${teacher.name} was removed.`);
      await load();
    } catch (err) {
      setError(apiMessage(err, "Unable to delete the account."));
    }
  }

  const activeCount = teachers.filter(
    (teacher) => (teacher.status || "active") === "active"
  ).length;

  return (
    <div className="space-y-6">
      <header className="qd-ink qd-fade-up qd-sheen relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 shadow-xl sm:p-8">
        <span className="qd-drift pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -bottom-36 right-16 h-72 w-72 rounded-full border border-white/5" />

        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              <ShieldCheck size={14} />
              Staff register
            </p>

            <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              Teacher Management
            </h1>

            <p className="mt-2 max-w-xl text-sm text-emerald-100/70">
              Every record the office keeps — subject, classes, joining date,
              contact details and whether the account is live.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/60">
                On register
              </p>
              <p className="text-3xl font-bold text-white">
                {loading ? "—" : teachers.length}
              </p>
            </div>

            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-300"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add Teacher
            </button>
          </div>
        </div>
      </header>

      <section className="qd-stagger grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SummaryTile
          icon={Users}
          label="Teachers"
          value={loading ? "—" : teachers.length}
          hint="on the staff register"
          bar="from-emerald-500 to-teal-500"
        />
        <SummaryTile
          icon={UserCheck}
          label="Active"
          value={loading ? "—" : activeCount}
          hint={`${teachers.length - activeCount} inactive`}
          tone="text-emerald-700 dark:text-emerald-300"
          bar="from-teal-500 to-sky-500"
        />
        <SummaryTile
          icon={BookOpen}
          label="Subjects"
          value={subjects.length}
          hint={subjects.slice(0, 2).join(", ") || "none recorded"}
          bar="from-amber-500 to-orange-500"
        />
        <SummaryTile
          icon={Building2}
          label="Classes covered"
          value={classesCovered.size}
          hint="across all teachers"
          bar="from-violet-500 to-fuchsia-500"
        />
      </section>

      {error && (
        <p
          role="alert"
          className="qd-fade-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="qd-fade-in flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 size={16} />
          {message}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-card to-slate-50 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, ID, subject or class"
              aria-label="Search teachers"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-inner outline-none transition focus:border-emerald-500 focus:bg-card focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              value={status}
              onChange={setStatus}
              options={[
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ]}
            />

            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              aria-label="Filter by subject"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500"
            >
              <option value="all">All subjects</option>
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort teachers"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500"
            >
              <option value="name">Sort: name</option>
              <option value="joined-new">Sort: newest joiners</option>
              <option value="joined-old">Sort: longest serving</option>
              <option value="experience">Sort: experience</option>
            </select>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              {[
                ["grid", LayoutGrid, "Card view"],
                ["table", Table2, "Table view"],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  title={label}
                  aria-label={label}
                  aria-pressed={view === key}
                  className={`rounded-lg p-2 transition ${
                    view === key
                      ? "bg-card text-emerald-700 shadow-sm dark:text-emerald-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {visible.length}
              </span>{" "}
              of {teachers.length}{" "}
              {teachers.length === 1 ? "teacher" : "teachers"}.
            </p>

            {(search || status !== "all" || subject !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setSubject("all");
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300"
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <div key={key} className="qd-skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="qd-scale-in flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-card to-slate-50 px-6 py-16 text-center">
          <span className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/20">
            <Users size={26} />
          </span>
          <p className="mt-1 text-lg font-bold text-slate-800">
            {teachers.length === 0
              ? "No teachers on the register yet"
              : "No teacher matches these filters"}
          </p>
          <p className="max-w-sm text-sm text-slate-500">
            {teachers.length === 0
              ? "Add a teacher to assign subjects, classes and a joining date."
              : "Try a different search term, or clear the subject and status filters."}
          </p>
          {teachers.length === 0 && (
            <button
              type="button"
              onClick={openAdd}
              className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              <Plus size={17} />
              Add the first teacher
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="qd-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((teacher) => (
            <TeacherCard
              key={teacher._id}
              teacher={teacher}
              onOpen={() => setDetail(teacher)}
              onEdit={() => openEdit(teacher)}
              onReset={() => openReset(teacher)}
              onDelete={() => remove(teacher)}
            />
          ))}
        </div>
      ) : (
        <TeacherTable
          teachers={visible}
          onOpen={(teacher) => setDetail(teacher)}
          onEdit={(teacher) => openEdit(teacher)}
          onReset={(teacher) => openReset(teacher)}
          onDelete={(teacher) => remove(teacher)}
        />
      )}

      {editor && (
        <TeacherForm
          adding={editor === "add"}
          form={form}
          error={error}
          saving={saving}
          onChange={update}
          onCancel={() => setEditor(null)}
          onSubmit={save}
        />
      )}

      {detail && (
        <TeacherDetail
          teacher={detail}
          onClose={() => setDetail(null)}
          onEdit={() => openEdit(detail)}
          onToggle={() => toggleStatus(detail)}
          onReset={() => openReset(detail)}
        />
      )}

      {reset && (
        <ResetPasswordDialog
          target={reset}
          onClose={() => setReset(null)}
          onDone={(text) => {
            setReset(null);
            setMessage(text);
          }}
        />
      )}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "text-slate-900",
  bar = "from-emerald-500 to-teal-500",
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${bar}`}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 text-emerald-700 shadow-inner dark:text-emerald-300">
          <Icon size={16} />
        </span>
      </div>

      <p className={`mt-3 text-3xl font-bold tracking-tight ${tone}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            value === key
              ? "bg-card text-emerald-700 shadow-sm dark:text-emerald-300"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Avatar({ teacher, size = "h-11 w-11 text-sm" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-md ring-2 ring-white/70 transition duration-300 group-hover:scale-105 ${size} ${toneFor(
        teacher.teacherId || teacher._id || teacher.name
      )}`}
      aria-hidden="true"
    >
      {initials(teacher.name)}
    </span>
  );
}

function ClassChips({ classes = [], max = 3 }) {
  if (!classes.length) {
    return <span className="text-xs text-slate-500">No classes assigned</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {classes.slice(0, max).map((item) => (
        <span
          key={item}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
        >
          {item}
        </span>
      ))}
      {classes.length > max && (
        <span className="text-[11px] font-semibold text-slate-500">
          +{classes.length - max} more
        </span>
      )}
    </div>
  );
}

function StatusChip({ status, ink = false }) {
  const active = (status || "active") === "active";

  // `ink` marks the chip as sitting inside always-dark chrome, where .qd-ink
  // has already restored the light palette and a `dark:` text override would
  // flip the label onto its own pale chip.
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        active
          ? `bg-emerald-50 text-emerald-700 ${ink ? "" : "dark:text-emerald-300"}`
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RowActions({ onOpen, onEdit, onReset, onDelete }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onOpen}
        title="View details"
        aria-label="View details"
        className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-800"
      >
        <Eye size={15} />
      </button>
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        aria-label="Edit teacher"
        className="rounded-lg bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100 dark:text-sky-300"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={onReset}
        title="Reset password"
        aria-label="Reset password"
        className="rounded-lg bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100 dark:text-amber-300"
      >
        <KeyRound size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        aria-label="Delete teacher"
        className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 dark:text-red-300"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function TeacherCard({ teacher, onOpen, onEdit, onReset, onDelete }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-card p-5 pt-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="flex items-start gap-3">
        <Avatar teacher={teacher} />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpen}
            className="block truncate text-left text-base font-bold text-slate-900 transition hover:text-emerald-700"
          >
            {teacher.name}
          </button>
          <p className="truncate text-xs text-slate-500">
            {teacher.designation || "Teacher"}
          </p>
        </div>

        <StatusChip status={teacher.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
          <BookOpen size={12} />
          {teacher.subject || "No subject set"}
        </span>

        {typeof teacher.experienceYears === "number" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            <Clock size={12} />
            {teacher.experienceYears} yr experience
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <Line icon={IdCard} label={teacher.teacherId || "No staff ID"} />
        <Line
          icon={CalendarDays}
          label={
            teacher.joinedAt
              ? `Joined ${formatDate(teacher.joinedAt)} · ${tenure(
                  teacher.joinedAt
                )}`
              : "Joining date not recorded"
          }
        />
      </dl>

      <div className="mt-3">
        <ClassChips classes={teacher.assignedClasses} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          {teacher.phone ? <Phone size={13} className="shrink-0" /> : <Mail size={13} className="shrink-0" />}
          <span className="truncate">
            {teacher.phone || teacher.email || "No contact given"}
          </span>
        </span>
        <RowActions
          onOpen={onOpen}
          onEdit={onEdit}
          onReset={onReset}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function Line({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Icon size={14} className="shrink-0 text-slate-400" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function TeacherTable({ teachers, onOpen, onEdit, onReset, onDelete }) {
  return (
    <div className="qd-fade-in overflow-x-auto rounded-2xl border border-slate-200 bg-card shadow-sm">
      <table className="w-full min-w-[860px]">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {[
              "Teacher",
              "Staff ID",
              "Subject",
              "Classes",
              "Joined",
              "Experience",
              "Status",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {teachers.map((teacher) => (
            <tr
              key={teacher._id}
              className="group transition odd:bg-slate-50/60 hover:bg-emerald-50/60"
            >
              <td className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => onOpen(teacher)}
                  className="flex items-center gap-3 text-left"
                >
                  <Avatar teacher={teacher} size="h-9 w-9 text-xs" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-800 transition group-hover:text-emerald-800">
                      {teacher.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {teacher.email}
                    </span>
                  </span>
                </button>
              </td>
              <td className="px-5 py-3 text-sm font-medium text-slate-600">
                {teacher.teacherId || "—"}
              </td>
              <td className="px-5 py-3 text-sm text-slate-600">
                {teacher.subject || "—"}
              </td>
              <td className="px-5 py-3">
                <ClassChips classes={teacher.assignedClasses} max={2} />
              </td>
              <td className="px-5 py-3 text-sm">
                <span className="font-medium text-slate-700">
                  {formatDate(teacher.joinedAt)}
                </span>
                {teacher.joinedAt && (
                  <span className="block text-xs text-slate-500">
                    {tenure(teacher.joinedAt)}
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-sm text-slate-600">
                {teacher.experienceYears
                  ? `${teacher.experienceYears} yr`
                  : "—"}
              </td>
              <td className="px-5 py-3">
                <StatusChip status={teacher.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  onOpen={() => onOpen(teacher)}
                  onEdit={() => onEdit(teacher)}
                  onReset={() => onReset(teacher)}
                  onDelete={() => onDelete(teacher)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeacherForm({ adding, form, error, saving, onChange, onCancel, onSubmit }) {
  // Portalled so the overlay sizes to the viewport — the animated page wrapper is
  // transformed, which would otherwise capture it as a `fixed` containing block.
  return createPortal(
    <div className="qd-fade-in fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      {/* Auto margins centre the form when it fits and align it to the top when
          it is taller than the viewport, which `items-center` would make
          unreachable above the scroll area. */}
      <div className="qd-scale-in my-auto w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              {adding ? "Add a teacher" : "Edit teacher record"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Everything marked with a star is required.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <fieldset className="space-y-3">
            <GroupTitle icon={Users} label="Account" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name *" name="name" value={form.name} onChange={onChange} />
              <Field label="Staff ID" name="teacherId" value={form.teacherId} onChange={onChange} placeholder="TCH-014" />
              <Field label="Email *" type="email" name="email" value={form.email} onChange={onChange} />
              <Field label="Username" name="username" value={form.username} onChange={onChange} hint="Leave blank to use the email" />
              <Field
                label={adding ? "Password *" : "New password"}
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                hint={adding ? "At least 8 characters" : "Leave blank to keep it"}
              />
              <Select label="Account status" name="status" value={form.status} onChange={onChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <GroupTitle icon={GraduationCap} label="Employment" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Subject" name="subject" value={form.subject} onChange={onChange} placeholder="Mathematics" />
              <Field label="Designation" name="designation" value={form.designation} onChange={onChange} placeholder="Senior Teacher" />
              <Field label="Qualification" name="qualification" value={form.qualification} onChange={onChange} placeholder="B.Ed, M.Sc" />
              <Field
                label="Experience (years)"
                type="number"
                name="experienceYears"
                value={form.experienceYears}
                onChange={onChange}
                hint="Years before joining"
              />
              <Field label="Joined on" type="date" name="joinedAt" value={form.joinedAt} onChange={onChange} />
              <Select label="Gender" name="gender" value={form.gender} onChange={onChange}>
                <option value="">Not recorded</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <GroupTitle icon={Phone} label="Contact" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone" name="phone" value={form.phone} onChange={onChange} />
              <Field label="Address" name="address" value={form.address} onChange={onChange} />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <GroupTitle icon={Building2} label="Assigned classes" />
            <Field
              label="Classes"
              name="assignedClasses"
              value={form.assignedClasses}
              onChange={onChange}
              placeholder="Grade 10 - A, Grade 10 - B"
              hint="Separate each class with a comma"
            />
            <ClassChips classes={toList(form.assignedClasses)} max={12} />
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : adding ? "Add teacher" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function GroupTitle({ icon: Icon, label }) {
  return (
    <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
      <Icon size={14} />
      {label}
    </legend>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-card";

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <input {...props} className={inputClass} />
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <select {...props} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

function TeacherDetail({ teacher, onClose, onEdit, onToggle, onReset }) {
  const classes = teacher.assignedClasses || [];
  const permissions = Object.keys(teacher.permissions || {});

  return createPortal(
    <div className="qd-fade-in fixed inset-0 z-[110] flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <aside className="qd-drawer flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <header className="qd-ink relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-5">
          <span className="qd-drift pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-emerald-400/15 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar teacher={teacher} size="h-14 w-14 text-lg" />
              <div className="min-w-0">
                <h2 className="truncate font-serif text-xl font-bold text-white">
                  {teacher.name}
                </h2>
                <p className="truncate text-sm text-emerald-100/70">
                  {teacher.designation || "Teacher"}
                  {teacher.subject ? ` · ${teacher.subject}` : ""}
                </p>
                <div className="mt-1.5">
                  <StatusChip status={teacher.status} ink />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-2 text-emerald-200/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="qd-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
          <DetailGroup icon={IdCard} title="Staff record">
            <DetailRow label="Staff ID" value={teacher.teacherId || "Not issued"} />
            <DetailRow label="Username" value={teacher.username || "—"} />
            <DetailRow
              label="Joined"
              value={
                teacher.joinedAt
                  ? `${formatDate(teacher.joinedAt)} · ${tenure(teacher.joinedAt)} of service`
                  : "Not recorded"
              }
            />
            <DetailRow
              label="Experience"
              value={
                teacher.experienceYears
                  ? `${teacher.experienceYears} years before joining`
                  : "Not recorded"
              }
            />
            <DetailRow label="Qualification" value={teacher.qualification || "—"} />
          </DetailGroup>

          <DetailGroup icon={Building2} title="Teaching load">
            <DetailRow label="Subject" value={teacher.subject || "Not assigned"} />
            <div className="pt-1">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Classes
              </p>
              {classes.length ? (
                <ClassChips classes={classes} max={12} />
              ) : (
                <p className="text-sm text-slate-500">No classes assigned.</p>
              )}
            </div>
            <DetailRow
              label="Module access"
              value={
                permissions.length
                  ? `${permissions.length} module${permissions.length > 1 ? "s" : ""} permitted`
                  : "No module permissions set"
              }
            />
          </DetailGroup>

          <DetailGroup icon={Phone} title="Contact">
            <DetailRow label="Email" value={teacher.email || "—"} icon={Mail} />
            <DetailRow label="Phone" value={teacher.phone || "Not given"} icon={Phone} />
            <DetailRow label="Address" value={teacher.address || "Not given"} icon={MapPin} />
            <DetailRow label="Gender" value={cap(teacher.gender)} />
          </DetailGroup>

          <DetailGroup icon={Clock} title="Account">
            <DetailRow label="Created" value={formatDate(teacher.createdAt)} />
            <DetailRow label="Last updated" value={formatDate(teacher.updatedAt)} />
          </DetailGroup>
        </div>

        <footer className="flex items-center gap-3 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Pencil size={16} />
            Edit record
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ShieldCheck size={16} />
            {teacher.status === "active" ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Reset password"
            aria-label="Reset password"
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:text-amber-300"
          >
            <KeyRound size={16} />
            Password
          </button>
        </footer>
      </aside>
    </div>,
    document.body
  );
}

function DetailGroup({ icon: Icon, title, children }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
        <Icon size={14} />
        {title}
      </h3>
      <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50 px-4">
        {children}
      </dl>
    </section>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {Icon && <Icon size={13} className="text-slate-400" />}
        {label}
      </dt>
      <dd className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  );
}
