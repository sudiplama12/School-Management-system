import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const ROLES = {
  student: {
    label: "Student",
    num: "01",
    icon: GraduationCap,
    placeholder: "Enter your student username",
    description: "Access classes, assignments, jobs, and applications.",
  },

  teacher: {
    label: "Teacher",
    num: "02",
    icon: Users,
    placeholder: "Enter your teacher username",
    description: "Manage students, attendance, and academic activities.",
  },

  parent: {
    label: "Parent",
    num: "03",
    icon: User,
    placeholder: "Enter your parent username",
    description: "Monitor student progress and home visits.",
  },

  admin: {
    label: "Admin",
    num: "04",
    icon: ShieldCheck,
    placeholder: "Enter administrator username",
    description: "Manage the complete school management system.",
  },
};

const FEATURES = [
  "Assignments, grades, and attendance in one place",
  "Direct communication between teachers and parents",
  "Job and internship opportunities for students",
];

function Constellation() {
  const nodes = [
    [60, 120],
    [160, 200],
    [140, 320],
    [280, 180],
    [330, 290],
    [250, 360],
    [70, 420],
    [220, 470],
    [310, 530],
  ];

  const edges = [
    [0, 1],
    [1, 2],
    [2, 5],
    [1, 3],
    [3, 4],
    [5, 4],
    [2, 6],
    [5, 7],
    [6, 7],
    [7, 8],
  ];

  const highlighted = new Set([1, 5]);

  return (
    <svg
      viewBox="0 0 400 640"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-50"
    >
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

      <g>
        {nodes.map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={highlighted.has(index) ? 4 : 3}
            fill={
              highlighted.has(index)
                ? "#d97706"
                : "#64748b"
            }
          />
        ))}
      </g>
    </svg>
  );
}

export default function Login({ onNavigateToRegister }) {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const currentRole = ROLES[role];
  const RoleIcon = currentRole.icon;

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setStatus("idle");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setStatus("working");

      const data = await login(
        cleanIdentifier,
        password,
        role
      );

      const loggedRole =
        data?.user?.role ||
        data?.role ||
        role;

      setStatus("done");

      switch (loggedRole) {
        case "student":
          navigate("/student");
          break;

        case "teacher":
          navigate("/teacher");
          break;

        case "parent":
          navigate("/parent");
          break;

        case "admin":
          navigate("/admin");
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      setStatus("idle");

      setError(
        err?.message ||
          "Login failed. Please check your username and password."
      );
    }
  };

  const handleRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-stretch justify-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] bg-white shadow-sm my-0 md:my-10 md:rounded-sm overflow-hidden">

        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}
        <aside className="hidden md:flex relative flex-col justify-between bg-slate-900 text-slate-200 p-12 overflow-hidden">

          <Constellation />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 font-serif text-xl font-semibold text-slate-50">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
            Smart LMS
          </div>

          {/* Main message */}
          <div className="relative z-10 max-w-sm">
            <h1 className="font-serif text-4xl font-medium leading-tight text-slate-50 mb-4">
              One login, every classroom.
            </h1>

            <p className="text-sm leading-relaxed text-slate-400 mb-7 max-w-xs">
              Students, teachers, parents, and administrators
              each get a workspace designed around what they
              need to do.
            </p>

            <ul className="flex flex-col gap-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <Check className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />

                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between border-t border-slate-700 pt-4 text-xs text-slate-500">
            <span>© 2026 Smart LMS</span>
            <span>Smart School Management</span>
          </div>
        </aside>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}
        <main className="p-8 sm:p-12 flex flex-col justify-center">

          {/* Mobile Logo */}
          <div className="md:hidden mb-8">
            <div className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
              <span className="h-2 w-2 rounded-full bg-amber-600 inline-block" />
              Smart LMS
            </div>
          </div>

          {/* Role tabs */}
          <nav className="flex gap-7 border-b border-slate-200 mb-9 overflow-x-auto">
            {Object.entries(ROLES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleChange(key)}
                className={`relative pb-3.5 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  role === key
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span
                  className={`font-serif italic text-xs ${
                    role === key
                      ? "text-amber-700"
                      : "text-slate-400"
                  }`}
                >
                  {item.num}
                </span>

                {item.label}

                {role === key && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-amber-600" />
                )}
              </button>
            ))}
          </nav>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="font-serif text-3xl font-medium text-slate-900 mb-2">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Sign in to your {currentRole.label.toLowerCase()}{" "}
              workspace and continue where you left off.
            </p>
          </div>

          {/* Selected role information */}
          <div className="flex gap-3 p-4 rounded-sm bg-slate-50 border border-slate-100 mb-6 max-w-sm">
            <div className="w-10 h-10 rounded-sm bg-amber-50 flex items-center justify-center shrink-0">
              <RoleIcon
                size={20}
                className="text-amber-700"
              />
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                {currentRole.label} Login
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {currentRole.description}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-sm bg-red-50 border border-red-200 text-sm text-red-700 max-w-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {status === "done" && (
            <div className="mb-5 p-3 rounded-sm bg-amber-50 border border-amber-200 text-sm text-amber-800 max-w-sm">
              Login successful. Redirecting...
            </div>
          )}

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-sm w-full"
          >
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">
                Username
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={identifier}
                  onChange={(e) =>
                    setIdentifier(e.target.value)
                  }
                  placeholder={currentRole.placeholder}
                  autoComplete="username"
                  disabled={loading}
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-sm border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full text-sm px-3.5 pr-11 py-2.5 rounded-sm border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={loading}
                  className="h-3.5 w-3.5 accent-amber-600"
                />

                Remember me
              </label>

              <button
                type="button"
                className="text-xs text-amber-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white text-sm font-medium py-3 rounded-sm transition-colors"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Signing in…
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 text-sm text-slate-500">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={handleRegister}
              className="font-medium text-amber-700 hover:underline"
            >
              Create an account
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 max-w-sm border-t border-slate-200 pt-5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
              Demo account
            </p>

            <p className="text-xs text-slate-500">
              Student:{" "}
              <span className="text-slate-700 font-medium">
                student1
              </span>{" "}
              /{" "}
              <span className="text-slate-700 font-medium">
                student123
              </span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}