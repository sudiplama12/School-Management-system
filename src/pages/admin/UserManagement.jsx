import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Pencil,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TriangleAlert,
  UserRound,
  Users,
  X,
} from "lucide-react";
import api from "../../api/axios";
import ResetPasswordDialog from "../../components/Admin/ResetPasswordDialog";

// One description per field, so the form layout, the payload builder and the
// edit-form loader all read the same list. These are the parts of a record the
// account owner cannot maintain itself — the student profile screen only offers
// phone and address — so the office needs a screen for the rest of them.
const fieldDefs = {
  name: { label: "Full name", required: true, placeholder: "Anisha Karki" },
  email: {
    label: "Email",
    type: "email",
    required: true,
    placeholder: "anisha@school.edu",
  },
  username: {
    label: "Username",
    placeholder: "anisha.karki",
    hint: "Leave blank to sign in with the email address.",
  },
  status: {
    label: "Account status",
    type: "select",
    options: [
      ["active", "Active"],
      ["inactive", "Inactive"],
    ],
    hint: "An inactive account is refused at sign-in.",
  },
  studentId: {
    label: "Student ID",
    placeholder: "ST001",
    hint: "Teachers and the child's parent account look the student up by this.",
  },
  className: {
    label: "Class",
    placeholder: "Grade 10",
    list: "ua-classes",
  },
  section: { label: "Section", placeholder: "A" },
  rollNumber: { label: "Roll number", placeholder: "12" },
  program: { label: "Program", placeholder: "Day stream" },
  semester: { label: "Semester", placeholder: "1" },
  dateOfBirth: { label: "Date of birth", type: "date", max: today() },
  gender: {
    label: "Gender",
    type: "select",
    omitBlank: true,
    options: [
      ["", "Not recorded"],
      ["male", "Male"],
      ["female", "Female"],
      ["other", "Other"],
    ],
  },
  admissionDate: {
    label: "Admitted on",
    type: "date",
    hint: "Shown on the teacher and parent screens.",
  },
  phone: { label: "Phone", placeholder: "98XXXXXXXX" },
  guardianName: { label: "Guardian name", placeholder: "Sita Karki" },
  guardianPhone: { label: "Guardian phone", placeholder: "98XXXXXXXX" },
  address: {
    label: "Address",
    multiline: true,
    span: 2,
    placeholder: "Ward 5, Banepa, Kavrepalanchok",
  },
  parentId: { label: "Parent ID", placeholder: "PA001" },
  childId: { type: "child", span: 2 },
};

const settings = {
  student: {
    title: "Student Management",
    singular: "Student",
    sections: [
      {
        title: "Account",
        icon: UserRound,
        fields: ["name", "username", "email", "status", "password"],
      },
      {
        title: "Enrolment",
        icon: GraduationCap,
        fields: [
          "className",
          "section",
          "studentId",
          "rollNumber",
          "dateOfBirth",
          "gender",
          "admissionDate",
          "semester",
          "program",
        ],
      },
      {
        title: "Guardian & contact",
        icon: Phone,
        fields: [
          "phone",
          "guardianPhone",
          "guardianName",
          "address",
        ],
      },
    ],
  },
  parent: {
    title: "Parent Management",
    singular: "Parent",
    sections: [
      {
        title: "Account",
        icon: UserRound,
        fields: ["name", "username", "email", "status", "password"],
      },
      {
        title: "Child record",
        icon: Users,
        fields: ["parentId", "childId"],
      },
      {
        title: "Contact",
        icon: Phone,
        fields: ["phone", "address"],
      },
    ],
  },
};

// Mirrors the temporary passwords the API generates so a suggested one reads
// back correctly over the phone: no 0/O, 1/I/l or punctuation.
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGIT = "23456789";

function suggestPassword(length = 10) {
  const all = UPPER + LOWER + DIGIT;
  const draws = new Uint32Array(2 * length);
  crypto.getRandomValues(draws);

  const chars = [
    UPPER[draws[0] % UPPER.length],
    LOWER[draws[1] % LOWER.length],
    DIGIT[draws[2] % DIGIT.length],
  ];

  for (let i = 3; i < length; i += 1) {
    chars.push(all[draws[i] % all.length]);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = draws[length + i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Date inputs need the local calendar day, never the UTC slice of toISOString.
function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
}

const always = ["name", "email", "username", "password", "status"];

const fieldsOf = (config) =>
  config.sections.flatMap((section) => section.fields);

function blankForm(config) {
  const form = { name: "", email: "", username: "", password: "", status: "active" };

  // The account fields appear in a section too, so skip them again rather than
  // overwriting the defaults with an empty value the selects cannot show.
  for (const name of fieldsOf(config)) {
    if (!always.includes(name)) form[name] = "";
  }

  return form;
}

function formFrom(config, user) {
  const form = blankForm(config);

  form.name = user.name || "";
  form.email = user.email || "";
  form.status = user.status || "active";
  // The API stores the email as the username when none was given, so an
  // account that signs in with its email should show an empty username box.
  form.username =
    user.username && user.username !== user.email ? user.username : "";

  for (const name of fieldsOf(config)) {
    if (always.includes(name)) continue;

    const value = user[name];

    if (value === null || value === undefined) {
      form[name] = "";
    } else if (fieldDefs[name].type === "date") {
      form[name] = toDateInput(value);
    } else {
      form[name] = String(value);
    }
  }

  return form;
}

const fieldId = (name) => `ua-field-${name}`;

export default function UserManagement({ role }) {
  const config = settings[role];

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(() => blankForm(config || settings.student));
  const [fieldErrors, setFieldErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [reset, setReset] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState([]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/users", {
        params: { role, search },
      });

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load accounts."
      );
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // A parent account is linked to one student, and typing that ID from memory
  // is where the mistakes happen, so the form offers the register instead.
  useEffect(() => {
    if (role !== "parent" || !modal) return undefined;

    let alive = true;

    api
      .get("/admin/students")
      .then(({ data }) => {
        if (alive) setStudents((data || []).filter((s) => s.studentId));
      })
      .catch(() => {
        // The picker is a convenience; the ID can still be typed.
        if (alive) setStudents([]);
      });

    return () => {
      alive = false;
    };
  }, [role, modal]);

  useEffect(() => {
    if (!modal) return undefined;

    const close = (event) => {
      // Escape while the reset dialog is stacked on top belongs to that dialog.
      if (event.key === "Escape" && !saving && !reset) setModal(false);
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [modal, saving, reset]);

  useEffect(() => {
    if (modal) document.getElementById(fieldId("name"))?.focus();
  }, [modal]);

  const classOptions = useMemo(
    () => [...new Set(users.map((user) => user.className).filter(Boolean))].sort(),
    [users]
  );

  function setValue(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  const update = (event) => setValue(event.target.name, event.target.value);

  function focusField(name) {
    const node = document.getElementById(fieldId(name));

    if (!node) return;

    node.focus();
    node.scrollIntoView({ block: "center" });
  }

  function openAdd() {
    setEditing(null);
    setForm(blankForm(config));
    setFieldErrors({});
    setFormError("");
    setError("");
    setMessage("");
    setModal(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm(formFrom(config, user));
    setFieldErrors({});
    setFormError("");
    setError("");
    setMessage("");
    setModal(true);
  }

  function validate() {
    const errors = {};

    if (!form.name.trim()) errors.name = "Everyone needs a name on their account.";

    const email = form.email.trim();

    if (!email) errors.email = "An email address is needed for sign-in.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Check this — it should look like name@school.edu.";
    }

    if (!editing && !form.password) {
      errors.password = "Set a password the family can be told.";
    } else if (form.password && form.password.length < 8) {
      errors.password = "Use at least 8 characters.";
    }

    return errors;
  }

  function buildPayload() {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      status: form.status,
    };

    const username = form.username.trim();

    if (username) payload.username = username;

    for (const name of fieldsOf(config)) {
      if (always.includes(name)) continue;

      const def = fieldDefs[name];
      const value = form[name].trim();

      // Blank has nothing storable for a date or the gender enum, and sending ""
      // would be a validation error, so the field is left untouched.
      if (!value && (def.omitBlank || def.type === "date")) continue;

      payload[name] = value;
    }

    return payload;
  }

  async function saveUser(event) {
    event.preventDefault();

    const errors = validate();
    const first = Object.keys(errors)[0];

    if (first) {
      setFieldErrors(errors);
      setFormError("");
      focusField(first);
      return;
    }

    setSaving(true);
    setError("");
    setFormError("");
    setMessage("");

    const payload = buildPayload();

    if (form.password) payload.password = form.password;

    try {
      if (editing) {
        await api.patch(`/admin/users/${editing._id}`, payload);
      } else {
        await api.post("/admin/users", { ...payload, role });
      }

      setModal(false);
      setMessage(
        editing
          ? `${payload.name}'s details were saved.`
          : `${payload.name} was added to the ${role} register.`
      );
      await loadUsers();
    } catch (err) {
      const text = err.response?.data?.message || "Unable to save the account.";
      // The API reports a unique-index clash as "That email is already in use.",
      // so put the complaint on the box that caused it rather than in a banner.
      const taken = text.match(/^That (\w+) is already in use\.$/);

      if (taken && [...always, ...fieldsOf(config)].includes(taken[1])) {
        setFieldErrors({ [taken[1]]: "Another account already uses this." });
        focusField(taken[1]);
      } else {
        setFormError(text);
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Delete ${user.name}'s account?`)) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/users/${user._id}`);
      setMessage(`${user.name}'s account was deleted.`);
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete account."
      );
    }
  }

  if (!config) {
    return <p className="p-6">Invalid account role.</p>;
  }

  const adding = !editing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Add, edit, search, and manage accounts — including resetting the
            password when someone cannot sign in.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} /> Add {config.singular}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}

      <div className="relative rounded-2xl border border-slate-200 bg-card p-4">
        <Search
          size={18}
          className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search by name, email or ${role} ID...`}
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card">
        <table className="w-full min-w-[650px]">
          <thead className="bg-slate-50">
            <tr>
              {["Name", "Email", "Status", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Loading accounts...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  {search
                    ? `No ${role}s match “${search}”.`
                    : `No ${role}s yet — use “Add ${config.singular}” above to create the first one.`}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {user.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        (user.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        title="Edit"
                        aria-label={`Edit ${user.name}`}
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 dark:text-blue-300"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setReset(user);
                          setError("");
                          setMessage("");
                        }}
                        title="Reset password"
                        aria-label={`Reset ${user.name}'s password`}
                        className="rounded-lg bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100 dark:text-amber-300"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => removeUser(user)}
                        title="Delete"
                        aria-label={`Delete ${user.name}`}
                        className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 dark:text-red-300"
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

      {modal &&
        // The page wrapper is transformed, so a `fixed` overlay rendered inside
        // it sizes to the content column instead of the viewport.
        createPortal(
          <div
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) setModal(false);
            }}
            className="qd-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ua-title"
              className="qd-scale-in flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
            >
              <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div className="min-w-0">
                  <h2 id="ua-title" className="font-serif text-2xl font-bold text-slate-900">
                    {adding ? `Add a ${config.singular.toLowerCase()}` : `Edit ${editing.name}`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {adding
                      ? "Fields with a star are required — the rest can be filled in later."
                      : `Update the record for ${editing.email}.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModal(false)}
                  aria-label="Close"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </header>

              <form
                noValidate
                onSubmit={saveUser}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="qd-scrollbar flex-1 space-y-6 overflow-y-auto px-6 py-5">
                  {config.sections.map((section) => {
                    const Icon = section.icon;

                    return (
                      <fieldset key={section.title} className="space-y-3">
                        <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                          <Icon size={14} />
                          {section.title}
                        </legend>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {section.fields.map((name) => {
                            if (name === "password") {
                              return (
                                <PasswordField
                                  key={name}
                                  adding={adding}
                                  value={form.password}
                                  error={fieldErrors.password}
                                  onValue={(value) => setValue("password", value)}
                                />
                              );
                            }

                            const def = fieldDefs[name];

                            if (def.type === "child") {
                              return (
                                <ChildField
                                  key={name}
                                  value={form[name]}
                                  error={fieldErrors[name]}
                                  students={students}
                                  onChange={update}
                                />
                              );
                            }

                            if (def.type === "select") {
                              return (
                                <SelectField
                                  key={name}
                                  id={fieldId(name)}
                                  name={name}
                                  label={def.label}
                                  hint={def.hint}
                                  options={def.options}
                                  value={form[name]}
                                  error={fieldErrors[name]}
                                  onChange={update}
                                />
                              );
                            }

                            return (
                              <Field
                                key={name}
                                id={fieldId(name)}
                                name={name}
                                type={def.type || (def.multiline ? undefined : "text")}
                                label={def.label}
                                required={def.required}
                                hint={def.hint}
                                placeholder={def.placeholder}
                                list={def.list}
                                max={def.max}
                                span={def.span}
                                multiline={def.multiline}
                                value={form[name]}
                                error={fieldErrors[name]}
                                onChange={update}
                              />
                            );
                          })}
                        </div>

                        {section.fields.some((name) => fieldDefs[name]?.list) && (
                          <datalist id="ua-classes">
                            {classOptions.map((value) => (
                              <option key={value} value={value} />
                            ))}
                          </datalist>
                        )}
                      </fieldset>
                    );
                  })}
                </div>

                <footer className="shrink-0 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                  {formError && (
                    <p
                      role="alert"
                      className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:text-red-300"
                    >
                      <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                      {formError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModal(false)}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {saving
                        ? "Saving…"
                        : adding
                          ? `Add ${config.singular}`
                          : "Save changes"}
                    </button>
                  </div>
                </footer>
              </form>
            </div>
          </div>,
          document.body
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

const inputClass =
  "w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-card";
const idleClass = "border-slate-200 focus:border-emerald-500";
const badClass = "border-red-300 bg-red-50/50 focus:border-red-500";

function Helper({ hint, error }) {
  if (error) {
    return (
      <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (!hint) return null;

  return <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>;
}

function LabelText({ label, required, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold text-slate-600"
    >
      {label}
      {required && <span className="ml-0.5 text-amber-600">*</span>}
    </label>
  );
}

function Field({ label, hint, error, span, multiline, ...props }) {
  const box = `${inputClass} ${error ? badClass : idleClass}`;

  return (
    <div className={span === 2 ? "sm:col-span-2" : undefined}>
      <LabelText label={label} required={props.required} htmlFor={props.id} />
      {multiline ? (
        <textarea
          {...props}
          rows={2}
          className={`${box} resize-none`}
          aria-invalid={error ? true : undefined}
        />
      ) : (
        <input
          {...props}
          className={box}
          aria-invalid={error ? true : undefined}
        />
      )}
      <Helper hint={hint} error={error} />
    </div>
  );
}

function SelectField({ label, hint, error, options, ...props }) {
  return (
    <div>
      <LabelText label={label} htmlFor={props.id} required={props.required} />
      <select
        {...props}
        aria-invalid={error ? true : undefined}
        className={inputClass + (error ? ` ${badClass}` : ` ${idleClass}`)}
      >
        {options.map(([value, text]) => (
          <option key={value || "blank"} value={value}>
            {text}
          </option>
        ))}
      </select>
      <Helper hint={hint} error={error} />
    </div>
  );
}

function PasswordField({ adding, value, error, onValue }) {
  const [reveal, setReveal] = useState(false);

  const remaining = 8 - value.length;

  const hint = !value
    ? adding
      ? "At least 8 characters. The family can change it after signing in."
      : "Leave blank to keep the current password."
    : remaining > 0
      ? `${remaining} more character${remaining === 1 ? "" : "s"} — the minimum is 8.`
      : adding
        ? "Ready to hand to the family."
        : "Anyone using this account will have to sign in again with it.";

  return (
    <div className="sm:col-span-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <LabelText
          label={adding ? "Password" : "New password"}
          required={adding}
          htmlFor={fieldId("password")}
        />
        <button
          type="button"
          onClick={() => {
            onValue(suggestPassword());
            setReveal(true);
          }}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-300"
        >
          <Sparkles size={12} />
          Suggest one
        </button>
      </div>

      <div className="relative">
        <input
          id={fieldId("password")}
          name="password"
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(event) => onValue(event.target.value)}
          autoComplete="new-password"
          className={`${inputClass} ${error ? badClass : idleClass} pr-11`}
          aria-invalid={error ? true : undefined}
        />
        <button
          type="button"
          onClick={() => setReveal((current) => !current)}
          aria-label={reveal ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <Helper hint={hint} error={error} />
    </div>
  );
}

function ChildField({ value, error, students, onChange }) {
  const child = students.find((student) => student.studentId === value);

  const summary = child
    ? [child.className, child.rollNumber && `Roll ${child.rollNumber}`]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="sm:col-span-2">
      <LabelText label="Child" htmlFor={fieldId("childId")} />

      {students.length ? (
        <select
          id={fieldId("childId")}
          name="childId"
          value={value}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          className={inputClass + (error ? ` ${badClass}` : ` ${idleClass}`)}
        >
          <option value="">Not linked yet</option>
          {/* Keeps an ID that no longer matches the register visible instead of
              silently rewriting the parent's link on save. */}
          {value && !child && (
            <option value={value}>{value} (no student found with this ID)</option>
          )}
          {students.map((student) => (
            <option key={student._id} value={student.studentId}>
              {`${student.name} · ${student.studentId}`}
              {student.className ? ` · ${student.className}` : ""}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId("childId")}
          name="childId"
          value={value}
          onChange={onChange}
          placeholder="ST001"
          className={inputClass + (error ? ` ${badClass}` : ` ${idleClass}`)}
          aria-invalid={error ? true : undefined}
        />
      )}

      <Helper
        error={error}
        hint={
          child
            ? `This account will see ${child.name}'s record${summary ? ` — ${summary}` : ""}.`
            : students.length
              ? "Pick the student whose attendance, notices and fees this account should show."
              : "No students are enrolled yet, so type the student ID — the list appears once students exist."
        }
      />
    </div>
  );
}
