"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/api";
import { useSession } from "./Session";
export default function NavBar() {
 const [logoutError,setLogoutError] = useState("");
 const {user,loading} = useSession();
 const pathname = usePathname(); const router = useRouter();
 return <nav className="navbar" aria-label="Main navigation">
 <Link href={user ? "/dashboard" : "/"} className="brand"><Image src="/Endowal Logo.png" alt="Endowal Edu logo" width={40} height={40} className="brand-logo"/><span className="brand-text"><strong>Endowal Edu</strong><span>{user ? `${user.role} account` : "School Finance Studio"}</span></span></Link>
 <div className="nav-links">{["Dashboard","Classrooms","Assignments","Bank","Credit","Grades"].map(label => <Link key={label} href={`/${label.toLowerCase()}`} aria-current={pathname === `/${label.toLowerCase()}` ? "page" : undefined}>{label}</Link>)}</div>
 <div className="session-menu">{loading ? <span>Loading account…</span> : user ? <><span>Signed in as <strong>{user.name}</strong><small>{user.role}</small></span><button className="ghost-btn" onClick={async () => {try {await signOut(); router.push("/auth");} catch {setLogoutError("Could not sign out. Try again.");}}}>Log out</button></> : <Link href="/auth" className="ghost-btn">Sign in</Link>}{logoutError&&<span role="alert">{logoutError}</span>}</div>
 </nav>;
}
