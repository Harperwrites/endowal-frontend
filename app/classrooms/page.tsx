const ClassroomsPage = () => {
  const classrooms = [
    {
      name: "Finance Lab A",
      students: 24,
      focus: "Savings sprint",
      budget: "$4,200",
      status: "Active",
    },
    {
      name: "Future Wealth 101",
      students: 18,
      focus: "Budget fundamentals",
      budget: "$3,100",
      status: "In review",
    },
    {
      name: "Entrepreneur Studio",
      students: 16,
      focus: "Micro-business planning",
      budget: "$5,550",
      status: "Active",
    },
  ];

  return (
    <section className="page-shell">
      <div className="hero">
        <div className="hero-card fade-in">
          <h1>Classroom Command Center</h1>
          <p>
            Manage learning cohorts, set weekly targets, and monitor student
            budgets without leaving the ocean floor.
          </p>
          <div className="action-row">
            <button className="primary-btn" type="button">
              Create classroom
            </button>
            <button className="ghost-btn" type="button">
              Import roster
            </button>
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-1">
          <div className="section-title">Today</div>
          <div className="card-list">
            <div className="list-item">
              <strong>2 classrooms</strong>
              <p className="subtle-text">Need budget approvals</p>
            </div>
            <div className="list-item">
              <strong>6 submissions</strong>
              <p className="subtle-text">Waiting for feedback</p>
            </div>
            <div className="list-item">
              <strong>12 parents</strong>
              <p className="subtle-text">Invited to portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card fade-in fade-delay-2">
        <div className="section-title">Active classrooms</div>
        <div className="grid-three">
          {classrooms.map((room) => (
            <div className="list-item" key={room.name}>
              <div className="card-title">
                <strong>{room.name}</strong>
                <span className="chip">{room.status}</span>
              </div>
              <p className="subtle-text">
                {room.students} students · {room.focus}
              </p>
              <p className="subtle-text">Weekly budget: {room.budget}</p>
              <div className="action-row">
                <button className="ghost-btn" type="button">
                  View roster
                </button>
                <button className="ghost-btn" type="button">
                  Assign mission
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-three">
        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Insights</div>
          <div className="card-list">
            <div className="list-item">
              <strong>Average savings rate</strong>
              <p className="subtle-text">18% across all cohorts</p>
            </div>
            <div className="list-item">
              <strong>Top lesson</strong>
              <p className="subtle-text">Needs vs wants challenge</p>
            </div>
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Upcoming</div>
          <div className="card-list">
            <div className="list-item">
              <strong>Budget review</strong>
              <p className="subtle-text">Finance Lab A · Tue 2:00 PM</p>
            </div>
            <div className="list-item">
              <strong>Pitch day</strong>
              <p className="subtle-text">Entrepreneur Studio · Fri</p>
            </div>
          </div>
        </div>
        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Quick actions</div>
          <div className="card-list">
            <button className="ghost-btn" type="button">
              Send parent update
            </button>
            <button className="ghost-btn" type="button">
              Export summary
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassroomsPage;
