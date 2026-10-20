"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, setToken } from "@/lib/api";

import { useSession } from "../components/Session";

const AuthPage = () => {
  const {user, loading: sessionLoading} = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { try {setEmail(localStorage.getItem("endowal_last_email") || "");} catch {} }, []);

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const handleSubmit = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const token = await login({ email, password });
        localStorage.setItem("endowal_last_email", email.trim());
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

  if (sessionLoading || user) return <section className="page-shell">Loading account…</section>;

  return (
    <section className="page-shell">
      <div className="hero">
        <form className="form-card fade-in" onSubmit={event => {event.preventDefault(); void handleSubmit();}}>
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
            name="username"
            autoComplete="username"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@school.org"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          {mode === "login" && <p className="remember-note">You’ll stay signed in on this browser for up to 30 days. Your email is remembered for next time.</p>}

          {status && (
            <div style={{ fontSize: 12, marginBottom: 12 }}>{status}</div>
          )}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Working..." : mode === "login" ? "Enter" : "Create account"}
          </button>
        </form>
        <div className="hero-card fade-in fade-delay-1">
          <h1 className="hero-title">Teach money with real-world rhythm.</h1>
          <p>
            Endowal Edu blends assignments, wallet simulations, and progress reports
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
