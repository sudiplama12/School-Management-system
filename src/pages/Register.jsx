import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
  Users,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";
import AuthScene from "../components/AuthScene";

const accountTypes = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "parent", label: "Parent", icon: Users },
];

const perks = [
  ["One place", "Notices, results and fees together"],
  ["Every teacher", "Home visits and queries in one thread"],
  ["Day by day", "Attendance and lessons as they happen"],
  ["Two scripts", "English and नेपाली side by side"],
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    schoolCode: "",
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // The school keeps its identity hidden until a sign-in succeeds, so nothing
  // is fetched here — the code is simply forwarded to /auth/register.
  useEffect(() => {
    document.title = "Smart LMS · Create account";
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "schoolCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.schoolCode.trim()) {
      setError("Enter your school code first.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        schoolCode: form.schoolCode.trim(),
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      setSuccess("Your account was created. You can now sign in.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to create your account. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-card focus:ring-4 focus:ring-emerald-600/10";

  const labelClass = "mb-1.5 block text-[13px] font-bold text-slate-700";

  return (
    <AuthScene
      eyebrow={
        <>
          <Sparkles size={13} />
          Your learning journey starts here
        </>
      }
      headline={
        <>
          One platform.
          <br />
          <span className="text-amber-300">More possibilities.</span>
        </>
      }
      blurb="Connect with your school, keep track of learning, and stay informed. Your school’s name appears once you sign in."
      highlights={perks}
      cardEyebrow="Get started"
      cardTitle="Create your account"
      lead="Join your school portal with the code the office gave you."
      footer={
        <>
          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-emerald-700 dark:text-emerald-300 transition hover:text-emerald-900"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
          <div>
            <label htmlFor="schoolCode" className={labelClass}>
              School code
            </label>
            <div className="relative">
              <Building2
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-300"
              />
              <input
                id="schoolCode"
                name="schoolCode"
                autoComplete="organization"
                required
                value={form.schoolCode}
                onChange={updateField}
                placeholder="Your school code"
                className="w-full rounded-2xl border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-3 text-sm font-semibold uppercase tracking-wider text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-600 focus:bg-card focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>Registering as</span>
            <div className="grid grid-cols-2 gap-2">
              {accountTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, role: value }))}
                  aria-pressed={form.role === value}
                  className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-[13px] font-semibold transition ${
                    form.role === value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/10 dark:text-emerald-300"
                      : "border-slate-300 bg-slate-100/70 text-slate-500 hover:border-emerald-300"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <div className="relative">
              <UserRound
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={updateField}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className={labelClass}>
              Username
            </label>
            <div className="relative">
              <UserRound
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="username"
                name="username"
                autoComplete="username"
                required
                minLength={3}
                value={form.username}
                onChange={updateField}
                placeholder="Choose a username"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={updateField}
                placeholder="8+ characters"
                className="w-full rounded-2xl border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-card focus:ring-4 focus:ring-emerald-600/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/70"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={updateField}
                placeholder="Repeat it"
                className="w-full rounded-2xl border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-card focus:ring-4 focus:ring-emerald-600/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/70"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="qd-shake flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:text-red-300"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="qd-pop flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || Boolean(success)}
          className="qd-gradient qd-shine group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-bold text-white shadow-lg shadow-emerald-800/25 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>
    </AuthScene>
  );
}
