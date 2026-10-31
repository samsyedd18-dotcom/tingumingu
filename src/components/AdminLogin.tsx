
import { useState } from "react";

interface Props {
  setLogged: (value: boolean) => void;
}

const API = "https://tingumingu-tau.vercel.app/api";

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

      const response = await fetch(`${API}/admin/login`, {
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

      // Save admin token
      if (!data.token) {
        throw new Error("Login successful, but backend did not return a token.");
      }

      localStorage.setItem("adminToken", data.token);

      // Verify admin session using Bearer token
      const checkResponse = await fetch(`${API}/admin/check`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!checkResponse.ok) {
        localStorage.removeItem("adminToken");
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
