"use client";
import Link from "next/link";
import StudentTransactionForm from "./StudentTransactionForm";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "./Session";
type Wallet = {id:number; classroom_id:number; classroom_name:string; balance:number; activity:Entry[]};
type Entry = {id:number; wallet_id:number; entry_type:string; assignment_id:number|null; assignment_title:string|null; amount:number; memo:string|null};
const money = (n:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
export default function StudentBank() {
 const {user} = useSession();
 const [wallets,setWallets] = useState<Wallet[]>([]);
 const [entries,setEntries] = useState<Entry[]>([]);
 const [selected,setSelected] = useState<number|null>(null);
 const [status,setStatus] = useState("Loading your accounts…");
 const [error,setError] = useState(false);
 const [revision,setRevision] = useState(0);
 useEffect(() => {
 let active=true; let busy=false;
 const refresh=async () => {
   if(busy) return; busy=true;
   try {
     const accounts=await apiFetch<Wallet[]>("/wallets/overview");
     if(active){setWallets(accounts);setEntries(accounts.flatMap(w=>w.activity));setSelected(previous=>{const classroom=Number(new URLSearchParams(window.location.search).get("classroom"));return accounts.some(w=>w.id===previous)?previous:accounts.find(w=>w.classroom_id===classroom)?.id??accounts[0]?.id??null;});setError(false);setStatus("");}
   } catch {if(active){setError(true);setStatus("We couldn’t refresh your accounts. Please try again.");}}
   finally{busy=false;}
 };
 refresh();
 const interval=window.setInterval(refresh,10000);
 window.addEventListener("focus",refresh);
 return ()=>{active=false;window.clearInterval(interval);window.removeEventListener("focus",refresh);};
 },[user,revision]);
 const wallet = wallets.find(w=>w.id===selected);
 const activity = entries.filter(e=>e.wallet_id===selected);
 return <section className="page-shell">
 <header className="bank-heading"><div><span className="tag">Student banking · Classroom money</span><h1>Your bank, {user?.name.split(" ")[0]}.</h1><p className="subtle-text">Your balances and recent activity, all in one place. Updates automatically every 10 seconds.</p></div><button className="ghost-btn" onClick={()=>setRevision(r=>r+1)}>Refresh balances</button></header>
 {status ? <div role={error ? "alert" : "status"} className="glass-card">{status}</div> : <>
 <div className="balance-banner"><div className="section-title">Total account balance</div><div className="balance-amount">{money(wallets.reduce((sum,w)=>sum+Math.round(Number(w.balance)*100),0)/100)}</div><p>Across {wallets.length} classroom {wallets.length===1?"account":"accounts"}</p><span className="chip">Simulated funds</span></div>
 {wallets.length === 0 ? <div className="glass-card"><h2>Your first account starts here</h2><p>Ask your teacher to create your classroom wallet. Your balance will appear here once it’s ready.</p></div> : <div className="bank-dashboard-grid"><div className="glass-card"><h2>My accounts</h2><div className="card-list">{wallets.map(w=><button key={w.id} className={`account-card list-item ${selected===w.id?"active":""}`} onClick={()=>setSelected(w.id)} aria-pressed={selected===w.id}><span>{w.classroom_name} · Account #{w.id}</span><strong>{money(Number(w.balance))}</strong><small>Current balance</small></button>)}</div></div>
 <div className="student-bank-main">{wallet&&<StudentTransactionForm key={wallet.id} walletId={wallet.id} classroomName={wallet.classroom_name} balance={Number(wallet.balance)} onPosted={()=>setRevision(r=>r+1)}/>}<div className="glass-card"><div className="card-title"><h2>Recent activity</h2><span className="chip">Account #{wallet?.id}</span></div><p className="subtle-text">Current balance: {money(Number(wallet?.balance??0))}</p>{activity.length===0 ? <p>No transactions yet for this account.</p> : <div className="card-list">{activity.slice(0,10).map(e=><div className="list-item" key={e.id}><div className="card-title"><strong>{e.memo||e.entry_type}</strong><span className={e.entry_type === "deposit" ? "money-in" : "money-out"}>{e.entry_type === "deposit" ? "+" : "−"}{money(Number(e.amount))}</span></div><p className="activity-assignment">✎ {e.assignment_title||"Classroom funds · no assignment linked"}</p><small>{e.entry_type === "withdrawal" ? "Expense" : "Deposit"} · Transaction #{e.id}</small></div>)}</div>}</div></div></div>}
 <div className="action-row"><Link className="ghost-btn" href="/assignments">My assignments</Link><Link className="ghost-btn" href="/credit">Explore credit</Link></div></>}
 </section>;
}
