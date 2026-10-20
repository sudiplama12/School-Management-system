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
import SchoolBrand from "../components/SchoolBrand";
import ThemeToggle from "../components/ThemeToggle";

const accountTypes = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "parent", label: "Parent", icon: Users },
];

const perks = [
  "School updates in one place",
  "Stay connected with teachers",
  "Track learning activities",
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
    "w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  const labelClass = "mb-1.5 block text-[13px] font-semibold text-slate-700";

  return (
    /* One fixed viewport, like the sign-in screen: only the form column
       scrolls, and only when the window is shorter than the card. */
    <main className="relative h-dvh overflow-hidden bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="qd-ink relative hidden overflow-hidden bg-emerald-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
        <div className="qd-drift absolute -right-28 -top-24 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="qd-drift-slow absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="qd-float absolute right-14 top-1/3 h-20 w-20 rounded-3xl border border-amber-300/25 bg-amber-300/10" />

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
            Your learning journey starts here
          </span>

          <h1 className="qd-fade-up qd-d-1 mt-5 font-serif text-4xl font-bold leading-[1.1] xl:text-5xl">
            One platform.
            <br />
            <span className="text-amber-300">More possibilities.</span>
          </h1>

          <p className="qd-fade-up qd-d-2 mt-4 max-w-md text-[15px] leading-7 text-emerald-100/75">
            Connect with your school, keep track of learning, and stay
            informed. Your school&rsquo;s name appears once you sign in.
          </p>

          <div className="qd-stagger mt-6 space-y-2.5">
            {perks.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                <span className="text-[15px] text-emerald-50/85">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-emerald-100/50">
          © {new Date().getFullYear()} Smart LMS
        </p>
      </section>

      {/* Registration form */}
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
              <UserRound size={22} />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              Get started
            </p>
            <h2 className="mt-1 font-serif text-[23px] font-extrabold leading-tight tracking-tight text-slate-900">
              Create your account
            </h2>
            <p className="mt-1 text-xs leading-4 text-slate-500">
              Join your school portal with the code the office gave you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="qd-fade-up qd-d-2 space-y-3 rounded-2xl border border-slate-200/80 bg-card/90 p-4 shadow-xl shadow-slate-300/40 backdrop-blur transition duration-300 hover:shadow-2xl hover:shadow-emerald-200/40 sm:p-5"
          >
            <div className="grid grid-cols-1 min-[430px]:grid-cols-2 gap-3">
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
                    className="w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-3 text-sm font-semibold uppercase tracking-wider text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
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
                      onClick={() =>
                        setForm((current) => ({ ...current, role: value }))
                      }
                      aria-pressed={form.role === value}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition ${
                        form.role === value
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-600/10"
                          : "border-slate-200 bg-card text-slate-500 hover:border-emerald-300"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 min-[430px]:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 min-[430px]:grid-cols-2 gap-3">
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
                    className="w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
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
                    className="w-full rounded-xl border border-slate-200 bg-card py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
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

            {success && (
              <div
                role="status"
                className="qd-pop flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-800 dark:text-emerald-300"
              >
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="qd-gradient qd-shine group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-800/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60"
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

          <p className="qd-fade-up qd-d-4 mt-3.5 flex items-center justify-center gap-1.5 text-[13px] text-slate-600">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-emerald-700 dark:text-emerald-300 transition hover:text-emerald-900 dark:hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
