import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="navbar">
      <Link href="/" className="brand">
        <Image
          src="/Endowal Logo.png"
          alt="Endowal Edu logo"
          width={40}
          height={40}
          className="brand-logo"
        />
        <span className="brand-text">
          <strong>Endowal Edu</strong>
          <span>School Finance Studio</span>
        </span>
      </Link>
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
