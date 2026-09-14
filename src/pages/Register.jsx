import { useState } from "react";
import { Check } from "lucide-react";

const ROLES = {
  student: {
    label: "Student",
    num: "01",
    idLabel: "Student ID",
    idPlaceholder: "e.g. STU-2049",
    title: "Create your student account",
    sub: "Set up your account to see classes, homework, and grades.",
    extraFields: [
      { key: "name", label: "Full name", placeholder: "Your full name", type: "text" },
      { key: "email", label: "Email", placeholder: "you@school.edu", type: "email" },
      { key: "grade", label: "Grade or class", placeholder: "e.g. Grade 9 — Section B", type: "text" },
    ],
  },
  teacher: {
    label: "Teacher",
    num: "02",
    idLabel: "Employee ID",
    idPlaceholder: "e.g. EMP-1180",
    title: "Create your teacher account",
    sub: "Set up your account to manage classes and student progress.",
    extraFields: [
      { key: "name", label: "Full name", placeholder: "Your full name", type: "text" },
      { key: "email", label: "Email", placeholder: "you@school.edu", type: "email" },
      { key: "subject", label: "Subject or department", placeholder: "e.g. Mathematics", type: "text" },
    ],
  },
  parent: {
    label: "Parent",
    num: "03",
    idLabel: "Email or phone number",
    idPlaceholder: "you@email.com",
    title: "Create your parent account",
    sub: "Link your account to your child's student profile.",
    extraFields: [
      { key: "name", label: "Full name", placeholder: "Your full name", type: "text" },
      { key: "childId", label: "Child's student ID", placeholder: "e.g. STU-2049", type: "text" },
    ],
  },
  admin: {
    label: "Admin",
    num: "04",
    allowSignup: false,
  },
};

const FEATURES = [
  "Assignments, grades, and attendance in one place",
  "Direct messages between teachers and parents",
  "Real-time progress reports for every child",
];

function Constellation() {
  const nodes = [
    [60, 120], [160, 200], [140, 320], [280, 180],
    [330, 290], [250, 360], [70, 420], [220, 470], [310, 530],
  ];
  const edges = [
    [0, 1], [1, 2], [2, 5], [1, 3], [3, 4], [5, 4],
    [2, 6], [5, 7], [6, 7], [7, 8],
  ];
  const highlighted = new Set([1, 5]);

  return (
    <svg
      viewBox="0 0 400 640"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-50"
    >
      <g stroke="#475569" strokeWidth="1">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      <g>
        {nodes.map(([x, y], i) => (
          <circle
            key={i}
            cx={x} cy={y}
            r={highlighted.has(i) ? 4 : 3}
            fill={highlighted.has(i) ? "#d97706" : "#64748b"}
          />
        ))}
      </g>
    </svg>
  );
}

export default function Register({ onNavigateToLogin }) {
  const [role, setRole] = useState("student");
  const [status, setStatus] = useState("idle");
  const current = ROLES[role];
  const isAdmin = role === "admin";

  function handleRoleChange(key) {
    setRole(key);
    setStatus("idle");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("working");
    setTimeout(() => setStatus("done"), 700);
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-stretch justify-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] bg-white shadow-sm my-0 md:my-10 md:rounded-sm overflow-hidden">

        {/* Left brand panel */}
        <aside className="hidden md:flex relative flex-col justify-between bg-slate-900 text-slate-200 p-12 overflow-hidden">
          <Constellation />

          <div className="relative z-10 flex items-center gap-2 font-serif text-xl font-semibold text-slate-50">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
            Smart LMS
          </div>

          <div className="relative z-10 max-w-sm">
            <h1 className="font-serif text-4xl font-medium leading-tight text-slate-50 mb-4">
              One login, every classroom.
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 mb-7 max-w-xs">
              Admins, teachers, students, and parents each get a workspace
              built for what they need to do — all inside a single account.
            </p>
            <ul className="flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex justify-between border-t border-slate-700 pt-4 text-xs text-slate-500">
            <span>© 2026 Smart LMS</span>
            <span>support@smartlms.edu</span>
          </div>
        </aside>

        {/* Right form panel */}
        <main className="p-8 sm:p-12 flex flex-col">

          {/* Role tabs */}
          <nav className="flex gap-7 border-b border-slate-200 mb-9 overflow-x-auto">
            {Object.entries(ROLES).map(([key, r]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleChange(key)}
                className={`relative pb-3.5 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  role === key ? "text-slate-900" : "text-slate-500"
                }`}
              >
                <span className={`font-serif italic text-xs ${role === key ? "text-amber-700" : "text-slate-400"}`}>
                  {r.num}
                </span>
                {r.label}
                {role === key && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-amber-600" />
                )}
              </button>
            ))}
          </nav>

          {isAdmin ? (
            <>
              <div className="mb-7">
                <h2 className="font-serif text-2xl font-medium text-slate-900 mb-2">Admin accounts</h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                  Admin accounts can't be self-registered.
                </p>
              </div>
              <div className="text-xs leading-relaxed bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-3 rounded-sm max-w-sm">
                Admin accounts are provisioned by your IT team. Contact your
                school's Smart LMS administrator to get set up.
              </div>
            </>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="font-serif text-2xl font-medium text-slate-900 mb-2">{current.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{current.sub}</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm w-full">
                {current.extraFields.map((f) => (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-700">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      className="text-sm px-3.5 py-2.5 rounded-sm border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">{current.idLabel}</label>
                  <input
                    type="text"
                    placeholder={current.idPlaceholder}
                    className="text-sm px-3.5 py-2.5 rounded-sm border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="text-sm px-3.5 py-2.5 rounded-sm border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">Confirm password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    className="text-sm px-3.5 py-2.5 rounded-sm border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-3 rounded-sm transition-colors"
                >
                  {status === "working"
                    ? "Creating account…"
                    : status === "done"
                    ? "Account created"
                    : "Create account"}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-medium text-amber-700 hover:underline"
                >
                  Log in instead
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}