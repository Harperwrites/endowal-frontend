"use client";
import { client } from "@/lib/client-config";
import Link from "next/link";
import CheckWriting from "./CheckWriting";
import BankArtwork from "./BankArtwork";
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
 return <section className="page-shell bank-boutique">
 <header className="bank-heading"><div><span className="tag">{client.bankName.toUpperCase()}</span><h1>Big dreams. Little money moves.</h1><p className="subtle-text">Welcome to your money corner, {user?.name.split(" ")[0]}. A little earning, a little spending, a lot of learning.</p></div><button className="ghost-btn" onClick={()=>setRevision(r=>r+1)}>Refresh balances</button></header>
 {status ? <div role={error ? "alert" : "status"} className="glass-card">{status}</div> : <>
 <div className="bank-money-hero"><div className="balance-banner"><span className="bank-money-eyebrow">✦ YOUR CLASSROOM TREASURY</span><div className="section-title">Total account balance</div><div className="balance-amount">{money(wallets.reduce((sum,w)=>sum+Math.round(Number(w.balance)*100),0)/100)}</div><p>Across {wallets.length} classroom {wallets.length===1?"account":"accounts"}</p><span className="chip">Classroom money · simulated funds</span><small className="bank-refresh-note">Balances refresh every 10 seconds.</small></div><div className="bank-art-corner"><BankArtwork/><span>Small change. Bright futures.</span></div></div>
 {wallets.length === 0 ? <div className="glass-card"><h2>Your first account starts here</h2><p>Ask your teacher to create your classroom wallet. Your balance will appear here once it’s ready.</p></div> : <div className="bank-dashboard-grid"><div className="glass-card bank-account-drawer"><span className="bank-panel-eyebrow">THE CASH DRAWER</span><h2>My classroom accounts</h2><div className="card-list">{wallets.map(w=><button key={w.id} className={`account-card list-item ${selected===w.id?"active":""}`} onClick={()=>setSelected(w.id)} aria-pressed={selected===w.id}><span className="banknote-header"><span aria-hidden="true">✦</span> {w.classroom_name}</span><strong>{money(Number(w.balance))}</strong><small>Account #{w.id} · Current balance</small></button>)}</div></div>
 <div className="student-bank-main">{wallet&&<StudentTransactionForm key={wallet.id} walletId={wallet.id} classroomName={wallet.classroom_name} balance={Number(wallet.balance)} onPosted={()=>setRevision(r=>r+1)}/>}<div className="glass-card bank-receipt"><div className="card-title"><h2>Your money trail</h2><span className="chip">Account #{wallet?.id}</span></div><p className="subtle-text">Current balance: {money(Number(wallet?.balance??0))}</p>{activity.length===0 ? <p>No transactions yet for this account.</p> : <div className="card-list">{activity.slice(0,10).map(e=><div className="list-item" key={e.id}><div className="card-title"><strong>{e.memo||e.entry_type}</strong><span className={e.entry_type === "deposit" ? "money-in" : "money-out"}>{e.entry_type === "deposit" ? "+" : "−"}{money(Number(e.amount))}</span></div><p className="activity-assignment">✎ {e.assignment_title||"Classroom funds · no assignment linked"}</p><small>{e.entry_type === "withdrawal" ? "Expense" : "Deposit"} · Receipt #{e.id}</small></div>)}</div>}</div></div></div>}
 {client.features.checkWriting&&<CheckWriting/>}
 <div className="action-row"><Link className="ghost-btn" href="/assignments">My assignments</Link>{client.features.credit&&<Link className="ghost-btn" href="/credit">Explore credit</Link>}</div></>}
 </section>;
}
