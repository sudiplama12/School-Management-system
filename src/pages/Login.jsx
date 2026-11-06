import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Users,
  Building2,
  LoaderCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import AuthScene from "../components/AuthScene";
import { useAuth } from "../context/AuthContext";

const roles = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "teacher", label: "Teacher", icon: BookOpen },
  { value: "parent", label: "Parent", icon: Users },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

const dashboards = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
  admin: "/admin",
};

const portals = [
  ["Student Portal", "Lessons, attendance and fees"],
  ["Teacher Portal", "Classes, visits and marks"],
  ["Parent Portal", "Your child, every day"],
  ["Admin Portal", "Records, library and fees"],
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, requestReveal } = useAuth();

  // Changing a password ends the session that made the change, so this screen is
  // where the confirmation has to appear.
  const notice = location.state?.notice;

  const [schoolCode, setSchoolCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // No school name, tagline or code is fetched here: the school identifies
  // itself only after a successful sign-in, on <SchoolReveal />.
  useEffect(() => {
    document.title = "Smart LMS · Sign in";
  }, []);

  const roleIndex = useMemo(
    () => Math.max(0, roles.findIndex((r) => r.value === role)),
    [role]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!schoolCode.trim()) {
      setError("Enter your school code first.");
      return;
    }

    if (!identifier.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(
        identifier.trim(),
        password,
        role,
        schoolCode.trim().toUpperCase()
      );

      const storedUser = localStorage.getItem("lms_user");
      const user =
        result?.user ||
        (typeof result === "object" ? result : null) ||
        (storedUser ? JSON.parse(storedUser) : null);

      const actualRole = String(user?.role || role).toLowerCase();

      if (!dashboards[actualRole]) {
        throw new Error("Your account has an invalid role.");
      }

      requestReveal();
      navigate(dashboards[actualRole], { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please check your credentials."
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
          A smarter way to learn
        </>
      }
      headline={
        <>
          One code.
          <br />
          <span className="text-amber-300">Four portals.</span>
        </>
      }
      blurb="Sign in with your school code and the account your school gave you. Your school’s name appears the moment you are in."
      highlights={portals}
      cardTitle="Sign in to your school portal"
      lead="The same school code works for every portal."
      footer={
        <>
          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
          New here?{" "}
          <Link
            to="/register"
            className="font-bold text-emerald-700 dark:text-emerald-300 transition hover:text-emerald-900"
          >
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
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
              type="text"
              autoComplete="organization"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
              placeholder="Your school code"
              className="w-full rounded-2xl border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-3 text-sm font-semibold uppercase tracking-wider text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-600 focus:bg-card focus:ring-4 focus:ring-emerald-600/10"
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Sign in as</span>

          <div className="relative grid grid-cols-4 rounded-2xl border border-slate-300 bg-slate-100/70 p-1">
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-1 top-1 rounded-xl bg-card shadow-md ring-1 ring-emerald-700/15 transition-transform duration-300 ease-out"
              style={{
                width: "calc((100% - 0.5rem) / 4)",
                transform: `translateX(${roleIndex * 100}%)`,
              }}
            />

            {roles.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={role === value}
                className={`relative z-10 flex items-center justify-center gap-1.5 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors duration-200 ${
                  role === value
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300"
                }`}
              >
                <Icon
                  size={16}
                  className={
                    role === value
                      ? "scale-110 text-emerald-700 dark:text-emerald-300 transition-transform duration-200"
                      : "transition-transform duration-200"
                  }
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="identifier" className={labelClass}>
            Username or email
          </label>

          <div className="relative">
            <Mail
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username"
              className={inputClass}
            />
          </div>
        </div>

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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-card focus:ring-4 focus:ring-emerald-600/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {notice && !error && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-800 dark:text-emerald-300"
          >
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="qd-shake flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:text-red-300"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="qd-gradient qd-shine group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-bold text-white shadow-lg shadow-emerald-800/25 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
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
