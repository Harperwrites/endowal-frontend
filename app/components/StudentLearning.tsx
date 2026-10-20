"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "./Session";
type Item = {id:number; name?:string; title?:string; description?:string; school_name?:string; due_date?:string; status?:string};
export default function StudentLearning({kind}:{kind:"classrooms"|"assignments"}) {
 const {user}=useSession(); const [items,setItems]=useState<Item[]>([]); const [status,setStatus]=useState("Loading…");
 useEffect(()=>{let active=true; (async()=>{try {
 const enrollments=await apiFetch<{classroom_id:number; status:string}[]>(`/enrollments?student_id=${user!.id}`);
 const ids=[...new Set(enrollments.filter(e=>e.status==="active").map(e=>e.classroom_id))];
 const results=await Promise.all(ids.map(id=>kind==="classrooms" ? apiFetch<Item>(`/classrooms/${id}`).then(i=>[i]) : apiFetch<Item[]>(`/assignments?classroom_id=${id}&status_filter=published`)));
 if(active){setItems(results.flat());setStatus("");}
 }catch {if(active)setStatus("Unable to load your classroom information. Please try again later.");}})(); return()=>{active=false;};},[user,kind]);
 return <section className="page-shell"><header className="bank-heading"><div><span className="tag">Student account</span><h1>My {kind}</h1><p className="subtle-text">{kind==="classrooms"?"The classrooms you’re enrolled in.":"Published assignments from your classrooms."}</p></div></header>{status ? <p role="status">{status}</p> : items.length ? <div className="grid-three">{items.map(i=><article className="glass-card" key={i.id}><h2>{i.title||i.name}</h2><p>{i.description||i.school_name}</p>{i.due_date && <p>Due: {i.due_date}</p>}</article>)}</div> : <div className="glass-card">No {kind} available yet. Check with your teacher.</div>}</section>;
}
