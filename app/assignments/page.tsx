const AssignmentsPage = () => {
  const assignments = [
    {
      title: "Needs vs. Wants",
      classroom: "Finance Lab A",
      due: "Friday",
      status: "Open",
      submissions: "78%",
    },
    {
      title: "Startup Budget",
      classroom: "Entrepreneur Studio",
      due: "Next week",
      status: "Review",
      submissions: "14 teams",
    },
    {
      title: "Credit Score Lab",
      classroom: "Future Wealth 101",
      due: "Monday",
      status: "Draft",
      submissions: "Not released",
    },
  ];

  return (
    <section className="page-shell">
      <div className="hero">
        <div className="hero-card fade-in">
          <h1>Assignment Control Deck</h1>
          <p>
            Design real-world finance missions, assign budgets, and track
            student progress with a single workflow.
          </p>
          <div className="action-row">
            <button className="primary-btn" type="button">
              Create assignment
            </button>
            <button className="ghost-btn" type="button">
              Load template
            </button>
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-1">
          <div className="section-title">Momentum</div>
          <div className="card-list">
            <div className="list-item">
              <strong>8 missions</strong>
              <p className="subtle-text">Currently active</p>
            </div>
            <div className="list-item">
              <strong>3 drafts</strong>
              <p className="subtle-text">Need publishing</p>
            </div>
            <div className="list-item">
              <strong>2 reviews</strong>
              <p className="subtle-text">Awaiting grading</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card fade-in fade-delay-2">
        <div className="section-title">Assignments pipeline</div>
        <div className="grid-three">
          {assignments.map((item) => (
            <div className="list-item" key={item.title}>
              <div className="card-title">
                <strong>{item.title}</strong>
                <span className="chip">{item.status}</span>
              </div>
              <p className="subtle-text">{item.classroom}</p>
              <p className="subtle-text">Due {item.due}</p>
              <p className="subtle-text">Submissions: {item.submissions}</p>
              <div className="action-row">
                <button className="ghost-btn" type="button">
                  View briefs
                </button>
                <button className="ghost-btn" type="button">
                  Review work
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-three">
        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Template vault</div>
          <div className="card-list">
            <div className="list-item">
              <strong>Budget Battle</strong>
              <p className="subtle-text">Competitive savings rounds</p>
            </div>
            <div className="list-item">
              <strong>Smart Shopping</strong>
              <p className="subtle-text">Price compare + sales tax</p>
            </div>
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Grading queue</div>
          <div className="card-list">
            <div className="list-item">
              <strong>6 submissions</strong>
              <p className="subtle-text">Ready for review</p>
            </div>
            <div className="list-item">
              <strong>2 feedback notes</strong>
              <p className="subtle-text">Pending student revisions</p>
            </div>
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Quick tools</div>
          <div className="card-list">
            <button className="ghost-btn" type="button">
              Export grades
            </button>
            <button className="ghost-btn" type="button">
              Message students
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssignmentsPage;
