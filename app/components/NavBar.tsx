"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { clearToken } from "@/lib/api";

const NavBar = () => {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsAuthed(Boolean(window.localStorage.getItem("endowal_token")));
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsAuthed(false);
    window.location.href = "/auth";
  };

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
        <Link href="/bank">Bank</Link>
        {isAuthed ? (
          <button
            type="button"
            className="ghost-btn"
            onClick={handleLogout}
          >
            Log out
          </button>
        ) : (
          <Link href="/auth">Sign In</Link>
        )}
      </div>
      <Link className="primary-btn" href="/auth">
        Enter Workspace
      </Link>
    </nav>
  );
};

export default NavBar;
