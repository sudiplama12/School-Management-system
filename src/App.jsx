
import { useState } from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {page === "login" ? (
        <Login
          onNavigateToRegister={() => setPage("register")}
        />
      ) : (
        <Register
          onNavigateToLogin={() => setPage("login")}
        />
      )}
    </>
  );
}

export default App;

