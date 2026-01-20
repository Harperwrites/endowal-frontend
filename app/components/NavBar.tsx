import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="brand">
        <strong>Endowal</strong>
        <span>School Finance Studio</span>
      </div>
      <div className="nav-links">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/classrooms">Classrooms</Link>
        <Link href="/assignments">Assignments</Link>
        <Link href="/auth">Sign In</Link>
      </div>
      <Link className="primary-btn" href="/auth">
        Enter Workspace
      </Link>
    </nav>
  );
};

export default NavBar;
