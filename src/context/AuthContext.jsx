import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const readSchool = () => {
  try {
    const saved = localStorage.getItem("lms_school");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("lms_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Cached so the school name is still on screen while /auth/me is in flight.
  const [school, setSchool] = useState(readSchool);

  const [loading, setLoading] = useState(false);

  // Timestamp key of the pending school reveal, or 0. The school's name is kept
  // off the sign-in screen and played once here after a successful login.
  const [reveal, setReveal] = useState(0);

  const requestReveal = () => setReveal(Date.now());
  const clearReveal = () => setReveal(0);

  const storeSchool = (next) => {
    if (!next) return;

    localStorage.setItem("lms_school", JSON.stringify(next));
    setSchool(next);
  };

  const login = async (identifier, password, role, schoolCode) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
        role,
        schoolCode: (schoolCode || "").trim(),
      });

      localStorage.setItem("lms_token", data.token);
      localStorage.setItem("lms_user", JSON.stringify(data.user));

      setUser(data.user);
      storeSchool(data.school);

      return data;
    } catch (err) {
      // No response at all means the request never reached Express — the usual
      // cause is a stopped backend, which is not a bad password.
      if (!err?.response) {
        throw new Error(
          "Cannot reach the school server. Check that the backend is running, then try again."
        );
      }

      throw new Error(
        err?.response?.data?.message || "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    localStorage.removeItem("lms_school");
    setUser(null);
    setSchool(null);
    setReveal(0);
  };

  // Pages read identity from this context, but `user` is only ever written at
  // login — so any change made through /profile or by an administrator stayed
  // invisible until the next sign-in. This pulls the live account document.
  const refreshUser = async () => {
    if (!localStorage.getItem("lms_token")) return null;

    try {
      const { data } = await api.get("/auth/me");

      if (data?.user) {
        localStorage.setItem("lms_user", JSON.stringify(data.user));
        setUser(data.user);
      }

      storeSchool(data?.school);

      return data?.user || null;
    } catch {
      return null;
    }
  };

  // Reconcile the cached account with the database on load, so an edit made
  // from another device or by an administrator shows up without signing out.
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived identity so pages never hardcode a student/teacher id. The backend
  // login and /auth/me responses already carry these fields on the user doc,
  // and add `child` for parents.
  const derived = {
    studentId: user?.studentId || null,
    teacherId: user?.teacherId || null,
    parentId: user?.parentId || null,
    child: user?.child || null,
    childStudentId: user?.child?.studentId || user?.childId || null,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        login,
        logout,
        loading,
        refreshUser,
        reveal,
        requestReveal,
        clearReveal,
        ...derived,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
