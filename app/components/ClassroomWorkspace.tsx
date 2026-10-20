"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "./Session";

type Room={id:number;name:string;school_name:string;teacher_name:string;student_count:number;grade_level:string};
type Submission={id:number;student_id:number;assignment_id:number;content:string;submitted_at:string};
type Task={id:number;title:string;description:string;due_date:string|null;status:string;submissions:Submission[]};
type Detail={id:number;name:string;students:{id:number;name:string}[];assignments:Task[]};
export default function ClassroomWorkspace({mode}:{mode:"classrooms"|"assignments"}) {
 const {user,loading}=useSession();
 if(loading)return <section className="page-shell">Loading account…</section>;
 if(!user)return <section className="page-shell"><h1>{mode}</h1><Link href="/auth">Sign in to continue</Link></section>;
 return <Workspace key={user.id} mode={mode} student={user.role==="student"}/>;
}
function Workspace({mode,student}:{mode:string;student:boolean}) {
 const [rooms,setRooms]=useState<Room[]>([]);const [selected,setSelected]=useState<number|null>(null);
 const [detail,setDetail]=useState<Detail|null>(null);const [error,setError]=useState("");const [pending,setPending]=useState(true);const [revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setPending(true);apiFetch<Room[]>("/learning/classrooms").then(data=>{if(active){setRooms(data);setSelected(current=>{const fromLink=Number(new URLSearchParams(window.location.search).get("classroom"));return data.some(r=>r.id===current)?current:data.some(r=>r.id===fromLink)?fromLink:data[0]?.id??null;});if(!data.length)setPending(false);}}).catch(()=>{if(active){setError("Unable to load classrooms. Try refreshing.");setPending(false);}});return()=>{active=false;};},[revision]);
 useEffect(()=>{if(!selected)return;let active=true;setPending(true);setDetail(null);setError("");apiFetch<Detail>(`/learning/classrooms/${selected}`).then(data=>{if(active)setDetail(data);}).catch(()=>{if(active)setError("Unable to load classroom work. Try refreshing.");}).finally(()=>{if(active)setPending(false);});return()=>{active=false;};},[selected,revision]);
 return <section className="page-shell"><header className="bank-heading"><div><span className="tag">{student?"Student workspace":"Teacher workspace"}</span><h1>{mode==="classrooms"?(student?"My classrooms":"Your classrooms"):"Assignments by classroom"}</h1><p className="subtle-text">{student?"Choose a classroom to view assignments and turn in your work.":"Choose a classroom, review submissions, or open a student’s dashboard."}</p></div><button className="ghost-btn" onClick={()=>setRevision(r=>r+1)}>Refresh classroom</button></header>
 {error&&<p className="grade-notice" role="alert">{error}</p>}
 <div className="grid-three">{rooms.map(room=><button key={room.id} className={`glass-card classroom-choice ${selected===room.id?"selected":""}`} aria-pressed={selected===room.id} onClick={()=>setSelected(room.id)}><span className="tag">Grade {room.grade_level}</span><h2>{room.name}</h2><p>{room.teacher_name} · {room.student_count} students</p><small>{room.school_name}</small></button>)}</div>
 {pending?<p role="status">Loading classroom…</p>:!rooms.length?<div className="glass-card">No classrooms available yet.</div>:detail&&<>
 {!student&&mode==="classrooms"&&<article className="glass-card"><h2>{detail.name} · Students</h2><p className="subtle-text">Open a student to view their classroom balances, grades, and submitted work.</p><div className="student-roster">{detail.students.map(s=><Link className="list-item" key={s.id} href={`/classrooms/${detail.id}/students/${s.id}`}><strong>{s.name}</strong><span>View dashboard →</span></Link>)}</div>{!detail.students.length&&<p>No enrolled students.</p>}</article>}
 <div className="bank-heading"><h2>{detail.name} · Assignments</h2>{!student&&<Link href="/grades" className="ghost-btn">Open gradebook</Link>}</div>
 {detail.assignments.length===0?<div className="glass-card">No assignments available yet.</div>:<div className="assignment-stack">{detail.assignments.map(task=><AssignmentCard key={`${detail.id}-${task.id}`} task={task} student={student} classroomId={detail.id} roster={detail.students} onSubmitted={submission=>setDetail(current=>current?{...current,assignments:current.assignments.map(a=>a.id===task.id?{...a,submissions:[submission]}:a)}:current)}/>)}</div>}
 </>}
 </section>;
}
function AssignmentCard({task,student,classroomId,roster,onSubmitted}:{task:Task;student:boolean;classroomId:number;roster:Detail["students"];onSubmitted:(s:Submission)=>void}) {
 const existing=task.submissions[0];const [response,setResponse]=useState(student?existing?.content??"":"");const [saving,setSaving]=useState(false);const [notice,setNotice]=useState("");
 const open=task.status==="active"||task.status==="published";
 const submit=async(event:FormEvent)=>{event.preventDefault();setSaving(true);setNotice("");try{const saved=await apiFetch<Submission>(`/learning/assignments/${task.id}/submission`,{method:"PUT",body:JSON.stringify({content:response})});onSubmitted(saved);setNotice("Assignment turned in. Your teacher can now view it.");}catch{setNotice("Unable to turn in your work. Confirm this assignment is still open and try again.");}finally{setSaving(false);}};
 return <article className="glass-card"><div className="card-title"><h2>{task.title}</h2><span className="chip">{student?(existing?"Turned in":open?"To do":"Closed"):`${task.submissions.length} turned in`}</span></div><p className="lesson-copy">{task.description}</p><p className="subtle-text">{task.due_date?`Due ${task.due_date}`:"No due date"} · {task.status}</p>
 {student?<form className="turn-in-form" onSubmit={submit}><label htmlFor={`response-${task.id}`}>Your assignment response</label><textarea id={`response-${task.id}`} required rows={6} maxLength={20000} disabled={saving||!open} value={response} onChange={e=>setResponse(e.target.value)} placeholder="Write your response, show your calculations, and explain your decisions."/>{existing&&<p className="subtle-text">Last turned in: {new Date(existing.submitted_at).toLocaleString()}</p>}<div className="action-row"><button className="primary-btn" disabled={saving||!open||!response.trim()}>{saving?"Turning in…":existing?"Update submission":"Turn in assignment"}</button><Link href={`/bank?classroom=${classroomId}&assignment=${task.id}`} className="ghost-btn">Banking for this assignment</Link><Link href="/grades" className="ghost-btn">View grades</Link></div>{notice&&<p role="status" className="grade-notice">{notice}</p>}</form>:<div className="submission-list">{task.submissions.length?task.submissions.map(s=><details className="list-item" key={s.id}><summary>{roster.find(r=>r.id===s.student_id)?.name??`Student ${s.student_id}`} · Turned in {new Date(s.submitted_at).toLocaleDateString()}</summary><p className="submitted-copy">{s.content}</p><Link className="ghost-btn" href={`/classrooms/${classroomId}/students/${s.student_id}`}>View student dashboard</Link></details>):<p>No submissions yet.</p>}</div>}
 </article>;
}
