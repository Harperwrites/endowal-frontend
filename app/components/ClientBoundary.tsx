"use client";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { client } from "@/lib/client-config";
export default function ClientBoundary({children}:{children:React.ReactNode}) {
 const path=usePathname();const [status,setStatus]=useState<"loading"|"ready"|"error"|"mismatch">("loading");const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setStatus("loading");fetch(`${API_BASE}/client`,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{if(active)setStatus(data.client_id===client.id&&data.self_registration===client.allowSelfRegistration&&["credit","messaging","interest"].every(key=>data.features?.[key]===client.features[key as "credit"|"messaging"|"interest"])?"ready":"mismatch");}).catch(()=>{if(active)setStatus("error");});return()=>{active=false;};},[retry]);
 const disabled=(path.startsWith("/credit")&&!client.features.credit);
 if(disabled)return <section className="page-shell"><h1>This feature isn’t enabled for {client.name}.</h1><Link href="/dashboard">Back to dashboard</Link></section>;
 // Public presentation remains usable without an API; account pages fail closed.
 if(path!=="/"&&status!=="ready")return <section className="page-shell" role="status"><h1>{status==="loading"?"Connecting to your learning space…":status==="mismatch"?"Client configuration mismatch":"Unable to connect to your learning space"}</h1>{status!=="loading"&&<><p>{status==="mismatch"?"The frontend and API client IDs must match. Check the deployment configuration.":"Please try again when the server is available."}</p><button className="ghost-btn" onClick={()=>setRetry(n=>n+1)}>Retry connection</button></>}</section>;
 return <>{children}</>;
}
