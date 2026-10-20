import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import SchoolBrand from "../components/SchoolBrand";
import ThemeToggle from "../components/ThemeToggle";
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
  const { login, requestReveal } = useAuth();

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
    "w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  const labelClass = "mb-1.5 block text-[13px] font-semibold text-slate-700";

  return (
    /* The auth screens are one fixed viewport tall: only the form column
       scrolls, and only when the window is shorter than the card. */
    <main className="relative h-dvh overflow-hidden bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="qd-ink relative hidden overflow-hidden bg-emerald-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
        <div className="qd-drift absolute -right-28 -top-28 h-[26rem] w-[26rem] rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="qd-drift-slow absolute -bottom-36 -left-24 h-[24rem] w-[24rem] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="qd-float absolute right-14 top-1/3 h-20 w-20 rounded-3xl border border-amber-300/25 bg-amber-300/10" />
        <div
          className="qd-float absolute bottom-1/4 left-20 h-12 w-12 rounded-2xl border border-emerald-300/20 bg-emerald-300/5"
          style={{ animationDelay: "1.6s" }}
        />

        <SchoolBrand
          school={null}
          portal="School Portal"
          tone="dark"
          size="lg"
          className="relative qd-slide-right"
        />

        <div className="relative max-w-xl py-4">
          <span className="qd-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
            <Sparkles size={13} />
            A smarter way to learn
          </span>

          <h1 className="qd-fade-up qd-d-1 mt-5 font-serif text-4xl font-bold leading-[1.1] xl:text-5xl">
            One code.
            <br />
            <span className="text-amber-300">Four portals.</span>
          </h1>

          <p className="qd-fade-up qd-d-2 mt-4 max-w-md text-[15px] leading-7 text-emerald-100/75">
            Sign in with your school code and the account your school gave you.
            Your school&rsquo;s name appears the moment you are in.
          </p>

          <div className="qd-stagger mt-6 grid grid-cols-2 gap-3">
            {portals.map(([title, subtitle]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-white/10"
              >
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-emerald-100/60">{subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-emerald-100/50">
          © {new Date().getFullYear()} Smart LMS
        </p>
      </section>

      {/* Form panel */}
      <section className="relative flex h-full items-center justify-center overflow-hidden px-4 py-4 sm:px-8">
        <div className="qd-drift absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="qd-drift-slow absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />

        <div className="qd-fade-up absolute right-4 top-4 sm:right-7 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="qd-scrollbar relative max-h-full w-full max-w-md overflow-y-auto overscroll-contain py-1">
          <div className="qd-fade-up mb-5 lg:hidden">
            <SchoolBrand school={null} portal="School Portal" tone="light" />
          </div>

          <div className="qd-fade-up qd-d-1 mb-4">
            <div className="qd-float mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:text-emerald-300 shadow-inner">
              <GraduationCap size={22} />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              Welcome back
            </p>

            <h2 className="mt-1 font-serif text-[23px] font-extrabold leading-tight tracking-tight text-slate-900">
              Sign in to your school portal
            </h2>

            <p className="mt-1 text-xs leading-4 text-slate-500">
              The same school code works for every portal.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="qd-fade-up qd-d-2 space-y-3 rounded-2xl border border-slate-200/80 bg-card/90 p-4 shadow-xl shadow-slate-300/40 backdrop-blur transition duration-300 hover:shadow-2xl hover:shadow-emerald-200/40 sm:p-5"
          >
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
                  className="w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-3 text-sm font-semibold uppercase tracking-wider text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            </div>

            <div>
              <span className={labelClass}>Sign in as</span>

              <div className="relative grid grid-cols-4 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1 top-1 rounded-lg bg-card shadow-md ring-1 ring-emerald-700/15 transition-transform duration-300 ease-out"
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
                    className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition-colors duration-200 ${
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
                  className="w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="qd-shake flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:text-red-300"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="qd-gradient qd-shine group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-800/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-70"
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

          <p className="qd-fade-up qd-d-4 mt-3.5 flex items-center justify-center gap-1.5 text-[13px] text-slate-600">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            New here?{" "}
            <Link
              to="/register"
              className="font-bold text-emerald-700 dark:text-emerald-300 transition hover:text-emerald-900 dark:hover:text-emerald-300"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
