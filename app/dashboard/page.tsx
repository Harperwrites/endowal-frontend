"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearToken, fetchMe } from "@/lib/api";

const DashboardPage = () => {
  const [name, setName] = useState("Teacher");
  const [role, setRole] = useState("teacher");
  const [status, setStatus] = useState("Loading workspace...");

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetchMe();
        setName(me.name || "Teacher");
        setRole(me.role || "teacher");
        setStatus("Ready");
      } catch (error) {
        setStatus("Session expired. Please sign in again.");
        clearToken();
      }
    };
    load();
  }, []);

  return (
    <section className="page-shell">
      <div className="hero">
        <div className="hero-card fade-in">
          <h1>Welcome back, {name}.</h1>
          <p>
            Your {role} workspace is live. Assign new budget missions, review
            student wallets, and track progress from one command deck.
          </p>
          <div className="tag">Status: {status}</div>
        </div>
        <div className="glass-card fade-in fade-delay-1">
          <div className="section-title">Today&apos;s Pulse</div>
          <div className="grid-three">
            <div className="list-item">
              <strong>5</strong>
              <div>Active classrooms</div>
            </div>
            <div className="list-item">
              <strong>18</strong>
              <div>Assignments running</div>
            </div>
            <div className="list-item">
              <strong>$12,480</strong>
              <div>Simulated budget flow</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-three">
        <div className="glass-card fade-in fade-delay-2">
          <div className="section-title">Classrooms</div>
          <div className="card-list">
            <div className="list-item">
              <strong>Finance Lab A</strong>
              <p style={{ color: "rgba(247,241,232,0.7)", margin: 0 }}>
                24 students · Savings challenge
              </p>
            </div>
            <div className="list-item">
              <strong>Future Wealth 101</strong>
              <p style={{ color: "rgba(247,241,232,0.7)", margin: 0 }}>
                18 students · Budget sprint
              </p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link className="ghost-btn" href="/classrooms">
              View classrooms
            </Link>
          </div>
        </div>

        <div className="glass-card fade-in fade-delay-2">
          <div className="section-title">Assignments</div>
          <div className="card-list">
            <div className="list-item">
              <strong>Needs vs. Wants</strong>
              <p style={{ color: "rgba(247,241,232,0.7)", margin: 0 }}>
                Due Friday · 78% submitted
              </p>
            </div>
            <div className="list-item">
              <strong>Startup Budget</strong>
              <p style={{ color: "rgba(247,241,232,0.7)", margin: 0 }}>
                Due next week · 14 teams
              </p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link className="ghost-btn" href="/assignments">
              Review assignments
            </Link>
          </div>
        </div>

        <div className="glass-card fade-in fade-delay-2">
          <div className="section-title">Student Wallets</div>
          <div className="card-list">
            <div className="list-item">
              <strong>Top growth</strong>
              <p style={{ color: "rgba(247,241,232,0.7)", margin: 0 }}>
                9 students increased savings
              </p>
            </div>
            <div className="list-item">
              <strong>Alerts</strong>
              <p style={{ color: "rgba(247,241,232,0.7)", margin: 0 }}>
                3 budgets need review
              </p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="ghost-btn" type="button">
              View wallets
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
