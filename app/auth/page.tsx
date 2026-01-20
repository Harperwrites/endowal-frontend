"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, setToken } from "@/lib/api";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const token = await login({ email, password });
        setToken(token.access_token);
        router.push("/dashboard");
      } else {
        await register({ email, name, role, password });
        setStatus("Account created. Please sign in.");
        setMode("login");
      }
    } catch (error) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="hero">
        <div className="form-card fade-in">
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button
              className={mode === "login" ? "primary-btn" : "ghost-btn"}
              type="button"
              onClick={() => setMode("login")}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button
              className={mode === "register" ? "primary-btn" : "ghost-btn"}
              type="button"
              onClick={() => setMode("register")}
              style={{ flex: 1 }}
            >
              Register
            </button>
          </div>

          {mode === "register" && (
            <>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Teacher or student name"
              />
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value === "teacher" ? "teacher" : "student")
                }
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@school.org"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          {status && (
            <div style={{ fontSize: 12, marginBottom: 12 }}>{status}</div>
          )}

          <button
            className="primary-btn"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Working..." : mode === "login" ? "Enter" : "Create account"}
          </button>
        </div>
        <div className="hero-card fade-in fade-delay-1">
          <h1>Teach money with real-world rhythm.</h1>
          <p>
            Endowal blends assignments, wallet simulations, and progress reports
            in one secure workspace. Keep every student on track without sharing
            sensitive bank data.
          </p>
          <div className="tag">Pilot-ready for schools</div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
