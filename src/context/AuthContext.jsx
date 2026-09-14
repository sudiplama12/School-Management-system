import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = {
  admin: {
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  teacher1: {
    username: "teacher1",
    password: "teacher123",
    role: "teacher",
  },
  student1: {
    username: "student1",
    password: "student123",
    role: "student",
  },
  parent1: {
    username: "parent1",
    password: "parent123",
    role: "parent",
  },
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

  const [loading, setLoading] = useState(false);

  const login = async (identifier, password, role) => {
    setLoading(true);

    try {
      const username = identifier.trim().toLowerCase();

      const demoUser = DEMO_USERS[username];

      if (!demoUser) {
        throw new Error("Invalid username.");
      }

      if (demoUser.password !== password) {
        throw new Error("Invalid password.");
      }

      if (demoUser.role !== role) {
        throw new Error("Selected role does not match this account.");
      }

      const loggedUser = {
        username: demoUser.username,
        role: demoUser.role,
      };

      localStorage.setItem(
        "lms_token",
        `demo-token-${demoUser.username}`
      );

      localStorage.setItem(
        "lms_user",
        JSON.stringify(loggedUser)
      );

      setUser(loggedUser);

      return {
        token: `demo-token-${demoUser.username}`,
        user: loggedUser,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
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