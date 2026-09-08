import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const ROLES = {
  student: {
    label: "Student",
    num: "01",
    idLabel: "Student ID or email",
    idPlaceholder: "e.g. STU-2049 or you@school.edu",
    title: "Welcome back",
    sub: "Access your assignments, grades, attendance, and messages.",
  },
  teacher: {
    label: "Teacher",
    num: "02",
    idLabel: "Employee ID or email",
    idPlaceholder: "e.g. EMP-1180 or you@school.edu",
    title: "Welcome back",
    sub: "Manage your classes, attendance, assignments, and grading.",
  },
  parent: {
    label: "Parent",
    num: "03",
    idLabel: "Email or phone number",
    idPlaceholder: "you@email.com",
    title: "Welcome back",
    sub: "Stay connected with your child's academic progress.",
  },
  admin: {
    label: "Admin",
    num: "04",
    idLabel: "Admin ID or email",
    idPlaceholder: "e.g. ADM-0007 or you@school.edu",
    title: "Admin sign in",
    sub: "Manage users, classes, reports, and school-wide settings.",
  },
};

const FEATURES = [
  "Assignments, grades, and attendance in one place",
  "Direct communication between teachers and parents",
  "Real-time academic progress for every student",
];

function Constellation() {
  const nodes = [
    [40, 100],
    [145, 165],
    [110, 285],
    [265, 135],
    [330, 245],
    [245, 335],
    [55, 395],
    [180, 445],
    [325, 515],
    [120, 540],
  ];

  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 5],
    [3, 4],
    [3, 5],
    [2, 6],
    [5, 7],
    [6, 7],
    [7, 8],
    [7, 9],
  ];

  return (
    <svg
      viewBox="0 0 400 640"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-60"
    >
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="145" cy="165" r="100" fill="url(#glow)" />
      <circle cx="245" cy="335" r="120" fill="url(#glow)" />

      <g stroke="#475569" strokeWidth="1">
        {edges.map(([a, b], index) => (
          <line
            key={index}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
          />
        ))}
      </g>

      {nodes.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={index === 1 || index === 5 ? 5 : 3}
          fill={index === 1 || index === 5 ? "#f59e0b" : "#64748b"}
        />
      ))}
    </svg>
  );
}

function RoleSelector({ role, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
      {Object.entries(ROLES).map(([key, item]) => {
        const active = role === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`relative rounded-xl px-2 py-3 text-center transition-all duration-200 ${
              active
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
            }`}
          >
            <span
              className={`block text-[10px] font-semibold tracking-wider ${
                active ? "text-amber-600" : "text-slate-400"
              }`}
            >
              {item.num}
            </span>

            <span className="mt-0.5 block text-xs font-semibold">
              {item.label}
            </span>

            {active && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-amber-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function Login({ onNavigateToRegister }) {
  const [role, setRole] = useState("student");
  const [status, setStatus] = useState("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const current = ROLES[role];
  const isAdmin = role === "admin";

  function handleRoleChange(newRole) {
    setRole(newRole);
    setStatus("idle");
  }

  function handleSubmit(e) {
    e.preventDefault();

    setStatus("working");

    setTimeout(() => {
      setStatus("done");
    }, 900);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] px-0 font-sans text-slate-900 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl overflow-hidden bg-white shadow-xl shadow-slate-200/50 md:min-h-[calc(100vh-48px)] md:rounded-3xl">
        {/* ================= LEFT PANEL ================= */}
        <aside className="relative hidden w-[44%] overflow-hidden bg-slate-950 text-white lg:flex">
          <Constellation />

          {/* Background gradients */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-14">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/20">
                  <Sparkles className="h-5 w-5 text-slate-950" />
                </div>

                <div>
                  <div className="font-serif text-xl font-semibold tracking-tight">
                    School
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Management System
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                One platform. Every classroom.
              </div>

              <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white xl:text-5xl">
                Everything your school needs,
                <span className="text-amber-400"> in one place.</span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                A smarter way for administrators, teachers, students, and
                parents to connect, collaborate, and keep learning on track.
              </p>

              <div className="mt-8 space-y-4">
                {FEATURES.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    </div>

                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-5 text-xs text-slate-500">
              <span>© 2026 Smart LMS</span>
              <span>support@lms.edu</span>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT PANEL ================= */}
        <main className="flex w-full flex-col justify-center px-6 py-8 sm:px-10 lg:w-[56%] lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-lg">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>

              <div className="font-serif text-lg font-semibold">
                School Management System 
              </div>
            </div>

            {/* Role selector */}
            <RoleSelector role={role} onChange={handleRoleChange} />

            {/* Heading */}
            <div className="mt-9">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                {current.label} portal
              </p>

              <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-950 sm:text-4xl">
                {current.title}
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                {current.sub}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex w-full max-w-md flex-col gap-5"
            >
              {/* ID */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  {current.idLabel}
                </label>

                <input
                  type="text"
                  required
                  placeholder={current.idPlaceholder}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>

                  {!isAdmin && (
                    <button
                      type="button"
                      className="text-xs font-medium text-amber-700 transition hover:text-amber-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              {!isAdmin && (
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-amber-600"
                  />
                  Keep me signed in
                </label>
              )}

              {/* Admin message */}
              {isAdmin && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

                    <p>
                      Admin accounts are provisioned by your IT team. Contact
                      your school's Smart LMS administrator if you need
                      credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "working"}
                className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "working" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing you in...
                  </>
                ) : status === "done" ? (
                  <>
                    Logged in as {current.label.toLowerCase()}
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            {!isAdmin && (
              <div className="mt-6 text-sm text-slate-500">
                New to Smart LMS?{" "}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-semibold text-amber-700 transition hover:text-amber-800 hover:underline"
                >
                  Create a {current.label.toLowerCase()} account
                </button>
              </div>
            )}

            {/* Divider */}
            {!isAdmin && (
              <>
                <div className="my-7 flex max-w-md items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  or continue with
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="flex max-w-md gap-3">
                  <button
                    type="button"
                    className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Google Workspace
                  </button>

                  <button
                    type="button"
                    className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Microsoft 365
                  </button>
                </div>
              </>
            )}

            {/* Security footer */}
            <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure access · Your information is protected
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}