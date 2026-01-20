import Link from "next/link";

export default function Home() {
  return (
    <section className="page-shell">
      <div className="hero">
        <div className="hero-card fade-in">
          <h1>Endowal turns financial literacy into real classroom momentum.</h1>
          <p>
            Build budgets, assign savings challenges, and reward smart decisions.
            Teachers stay in control while students see their money habits grow.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="primary-btn" href="/auth">
              Start as a Teacher
            </Link>
            <Link className="ghost-btn" href="/assignments">
              Explore Assignments
            </Link>
          </div>
          <div className="footer-note">
            Deep ocean dashboards. Pearl-bright insights. Built for schools.
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-1">
          <div className="section-title">In one studio</div>
          <div className="grid-three">
            <div className="list-item">
              <div className="tag">Teacher Tools</div>
              <h3>Assign real-world budget missions.</h3>
              <p style={{ color: "rgba(247,241,232,0.7)" }}>
                Create deposit vs. spending projects, then grade outcomes in a
                single view.
              </p>
            </div>
            <div className="list-item">
              <div className="tag">Student Flow</div>
              <h3>Visualize each student wallet.</h3>
              <p style={{ color: "rgba(247,241,232,0.7)" }}>
                Track balances, goals, and compliance without exposing personal
                bank data.
              </p>
            </div>
            <div className="list-item">
              <div className="tag">Reporting</div>
              <h3>Measure outcomes fast.</h3>
              <p style={{ color: "rgba(247,241,232,0.7)" }}>
                Classroom scorecards, milestone completion, and growth trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
