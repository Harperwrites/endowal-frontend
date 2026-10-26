"use client";
import Image from "next/image";
import { client,roleLabel } from "@/lib/client-config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/api";
import { useSession } from "./Session";
export default function NavBar() {
 const [logoutError,setLogoutError] = useState("");
 const {user,loading} = useSession();
 const pathname = usePathname(); const router = useRouter();
 if(pathname==="/")return <nav className="navbar landing-navbar" aria-label="Main navigation"><Link href="/" className="brand"><Image src={client.logo} alt={client.logoAlt} width={40} height={40} className="brand-logo"/><span className="brand-text"><strong>{client.name}</strong><small className="platform-credit">A technology platform by Manifest Treasures LLC</small><span>{client.tagline}</span></span></Link><div className="nav-links">{client.features.publicDemo&&<a href="#interactive-demo">Try the demo</a>}<a href="#how-it-works">The experience</a><a href="#the-why">The why</a></div><div className="landing-nav-actions"><Link href={user?"/dashboard":"/auth"}>{user?"My dashboard":"Sign in"}</Link>{client.features.interest&&<a href="#back-the-future">Build with us ↗</a>}</div></nav>;
 return <nav className="navbar" aria-label="Main navigation">
 <Link href={user ? "/dashboard" : "/"} className="brand"><Image src={client.logo} alt={client.logoAlt} width={40} height={40} className="brand-logo"/><span className="brand-text"><strong>{client.name}</strong><small className="platform-credit">A technology platform by Manifest Treasures LLC</small><span>{user ? `${roleLabel(user.role)} account` : "School Finance Studio"}</span></span></Link>
 <div className="nav-links">{(["dashboard","classrooms","assignments","bank","credit","grades"] as const).filter(key=>key!=="credit"||client.features.credit).map(key => <Link key={key} href={`/${key}`} aria-current={pathname === `/${key}` ? "page" : undefined}>{client.labels[key]}</Link>)}</div>
 <div className="session-menu">{loading ? <span>Loading account…</span> : user ? <><span>Signed in as <strong>{user.name}</strong><small>{roleLabel(user.role)}</small></span><button className="ghost-btn" onClick={async () => {try {await signOut(); router.push("/auth");} catch {setLogoutError("Could not sign out. Try again.");}}}>Log out</button></> : <Link href="/auth" className="ghost-btn">Sign in</Link>}{logoutError&&<span role="alert">{logoutError}</span>}</div>
 </nav>;
}
