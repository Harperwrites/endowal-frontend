"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { fetchMe, apiFetch } from "@/lib/api";
type User = Awaited<ReturnType<typeof fetchMe>>;
const Session = createContext<{user: User | null; loading: boolean}>({user:null, loading:true});
export function SessionProvider({children}: {children: React.ReactNode}) {
  const [user,setUser] = useState<User|null>(null);
  const [loading,setLoading] = useState(true);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++sequence.current;
    try {
      const current = await fetchMe();
      if(version !== sequence.current) return;
      setUser(current);
      localStorage.setItem("endowal_last_email", current.email);
      // Upgrade already-signed-in browsers without asking for credentials again.
      void apiFetch("/auth/remember", {method:"POST"}).catch(() => {});
    } catch {
      if(version === sequence.current && !localStorage.getItem("endowal_token")) setUser(null);
    } finally { if(version === sequence.current) setLoading(false); }
  }, []);
  useEffect(() => { refresh(); window.addEventListener("endowal-session",refresh); window.addEventListener("storage",refresh); return () => { window.removeEventListener("endowal-session",refresh); window.removeEventListener("storage",refresh); }; },[refresh]);
  return <Session.Provider value={{user,loading}}>{children}</Session.Provider>;
}
export const useSession = () => useContext(Session);
