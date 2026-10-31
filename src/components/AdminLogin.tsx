
import { useState } from "react";

interface Props {
  setLogged: (value: boolean) => void;
}

function AdminLogin({ setLogged }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!password.trim()) {
      alert("Please enter admin password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Verify that the browser received a valid session.
      const checkResponse = await fetch("/api/admin/check", {
        method: "GET",
        credentials: "include",
      });

      if (!checkResponse.ok) {
        throw new Error("Admin session could not be verified");
      }

      alert("Admin Login Successful");
      setPassword("");
      setLogged(true);

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login">
      <div className="admin-box">
        <h2>👑 Admin Login</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminLogin;
