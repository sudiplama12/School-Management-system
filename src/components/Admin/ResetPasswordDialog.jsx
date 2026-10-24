import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import api from "../../api/axios";

const MODES = [
  [
    "generate",
    "Generate a temporary password",
    "The office reads it out or hands it over. It is shown once, then only the hash is kept.",
  ],
  [
    "choose",
    "Type a new password",
    "Minimum 8 characters. Ask the account holder to change it after their next sign-in.",
  ],
];

export default function ResetPasswordDialog({ target, onClose, onDone }) {
  const [mode, setMode] = useState("generate");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  const handle = target.username || target.email || target._id;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  // The value is only ever held in this component's state, so the timer that
  // drops the "Copied" tick has to go with the dialog.
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  async function submit(event) {
    event?.preventDefault();

    if (mode === "choose") {
      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("The two passwords do not match.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const { data } = await api.put(
        `/admin/users/${target._id}/password`,
        mode === "choose" ? { password } : {}
      );

      // A generated password has to stay on screen for the office to read it,
      // so the dialog becomes the receipt instead of closing.
      if (data.temporaryPassword) {
        setIssued(data.temporaryPassword);
      } else {
        onDone(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change the password.");
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(issued);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard access was blocked — select the password and copy it.");
    }
  }

  function finish() {
    onDone(`${target.name}'s temporary password was created.`);
  }

  // Portal: the animated page wrapper is transformed, which makes it the
  // containing block for `fixed` and would trap this overlay inside the content
  // column instead of the viewport.
  return createPortal(
    <div
      className="qd-fade-in fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reset the password for ${target.name}`}
        className="qd-fade-up my-6 w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 text-emerald-950 shadow-md shadow-amber-500/20">
              <KeyRound size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-800">
                {issued ? "Temporary password ready" : "Reset password"}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {target.name} · {handle}
                {target.role ? ` · ${target.role}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={saving ? undefined : onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        {issued ? (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">
              Hand this to <strong className="text-slate-800">{target.name}</strong>{" "}
              and have them sign in with it right away.
            </p>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center dark:border-emerald-800">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Temporary password
              </p>
              <p className="mt-2 select-all break-all font-mono text-2xl font-bold tracking-wider text-slate-900">
                {issued}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  {copied ? <Check size={15} /> : <ClipboardCopy size={15} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                >
                  <RefreshCw size={15} />
                  {saving ? "Creating…" : "Another one"}
                </button>
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
              <Sparkles size={14} className="mt-0.5 shrink-0" />
              This is the only time the password is shown. It cannot be
              recovered later — generate another one if it is lost.
            </p>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={finish}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div role="radiogroup" aria-label="Reset method" className="space-y-2.5">
              {MODES.map(([id, label, hint]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={mode === id}
                  onClick={() => {
                    setMode(id);
                    setError("");
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                    mode === id
                      ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 dark:bg-emerald-900/30"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      mode === id ? "border-emerald-600" : "border-slate-300"
                    }`}
                  >
                    {mode === id && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {mode === "choose" && (
              <div className="qd-fade-in space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                    New password
                  </span>
                  <span className="relative block">
                    <input
                      autoFocus
                      name="new-password"
                      type={reveal ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-11 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => setReveal((current) => !current)}
                      aria-label={reveal ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      {reveal ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Confirm password
                  </span>
                  <input
                    name="confirm-password"
                    type={reveal ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-card"
                  />
                </label>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Signing in again is required everywhere this account is already
              open.
            </p>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {saving
                  ? "Resetting…"
                  : mode === "generate"
                    ? "Generate password"
                    : "Change password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
