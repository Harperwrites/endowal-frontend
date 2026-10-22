"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "./Session";
import ClassroomScene from "./ClassroomScene";

type Room={id:number;name:string;school_name:string;teacher_name:string;student_count:number;grade_level:string};
type Submission={id:number;student_id:number;assignment_id:number;content:string;submitted_at:string};
type Task={id:number;title:string;description:string;due_date:string|null;status:string;submissions:Submission[]};
type Detail={id:number;name:string;students:{id:number;name:string}[];assignments:Task[]};
export default function ClassroomWorkspace({mode}:{mode:"classrooms"|"assignments"}) {
 const {user,loading}=useSession();
 if(loading)return <section className="page-shell">Loading account…</section>;
 if(!user)return <section className="page-shell"><h1>{mode}</h1><Link href="/auth">Sign in to continue</Link></section>;
 return <Workspace key={user.id} mode={mode} student={user.role==="student"} firstName={user.name?.split(" ")[0]||"My"}/>;
}
function Workspace({mode,student,firstName}:{mode:string;student:boolean;firstName:string}) {
 const [rooms,setRooms]=useState<Room[]>([]);const [selected,setSelected]=useState<number|null>(null);
 const [detail,setDetail]=useState<Detail|null>(null);const [error,setError]=useState("");const [pending,setPending]=useState(true);const [revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setPending(true);apiFetch<Room[]>("/learning/classrooms").then(data=>{if(active){setRooms(data);setSelected(current=>{const fromLink=Number(new URLSearchParams(window.location.search).get("classroom"));return data.some(r=>r.id===current)?current:data.some(r=>r.id===fromLink)?fromLink:data[0]?.id??null;});if(!data.length)setPending(false);}}).catch(()=>{if(active){setError("Unable to load classrooms. Try refreshing.");setPending(false);}});return()=>{active=false;};},[revision]);
 useEffect(()=>{if(!selected)return;let active=true;setPending(true);setDetail(null);setError("");apiFetch<Detail>(`/learning/classrooms/${selected}`).then(data=>{if(active)setDetail(data);}).catch(()=>{if(active)setError("Unable to load classroom work. Try refreshing.");}).finally(()=>{if(active)setPending(false);});return()=>{active=false;};},[selected,revision]);
 return <section className={`page-shell ${mode==="classrooms"?"classroom-scene-page":"mission-planner-page"}`}><header className="bank-heading"><div><span className="tag">{student?"Student workspace":"Teacher workspace"}</span><h1>{mode==="classrooms"?(student?"Come on in.":"Welcome to your classroom."):"Your next little mission."}</h1><p className="subtle-text">{student?"Choose a classroom to view assignments and turn in your work.":"Choose a classroom, review submissions, or open a student’s dashboard."}</p></div><button className="ghost-btn" onClick={()=>setRevision(r=>r+1)}>Refresh classroom</button></header>
 {error&&<p className="grade-notice" role="alert">{error}</p>}
 <div className={mode==="classrooms"?"school-room-tabs":"mission-classroom-tabs"} aria-label="Choose a classroom">{rooms.map(room=><button key={room.id} className={`${mode==="classrooms"?"school-room-tab":"mission-classroom-tab"} ${selected===room.id?"selected":""}`} aria-pressed={selected===room.id} onClick={()=>setSelected(room.id)}><span className="tag">Grade {room.grade_level}</span><h2>{room.name}</h2><p>{room.teacher_name} · {room.student_count} students</p><small>{room.school_name}</small></button>)}</div>
 {pending?<p role="status">Loading classroom…</p>:!rooms.length?<div className="glass-card">No classrooms available yet.</div>:detail&&<>
 {mode==="classrooms"&&<ClassroomScene key={`scene-${detail.id}`} onOpenAssignment={id=>window.dispatchEvent(new CustomEvent("endowal-open-assignment",{detail:{classroomId:detail.id,assignmentId:id}}))} classroomId={detail.id} name={detail.name} teacherName={rooms.find(r=>r.id===detail.id)?.teacher_name||"Your teacher"} firstName={firstName} student={student} students={detail.students} assignments={detail.assignments}/>}
 {mode==="classrooms"?<ClassroomAssignmentBoard key={`board-${detail.id}`} detail={detail} student={student} onSubmitted={(taskId,submission)=>setDetail(current=>current?{...current,assignments:current.assignments.map(a=>a.id===taskId?{...a,submissions:[submission]}:a)}:current)}/>:<AssignmentMissionPlanner key={`planner-${detail.id}`} detail={detail} student={student} onSubmitted={(taskId,submission)=>setDetail(current=>current?{...current,assignments:current.assignments.map(a=>a.id===taskId?{...a,submissions:[submission]}:a)}:current)}/>}

 </>}
 </section>;
}
function AssignmentMissionPlanner({detail,student,onSubmitted}:{detail:Detail;student:boolean;onSubmitted:(id:number,s:Submission)=>void}) {
 const [active,setActive]=useState<number|null>(null);
 const [filter,setFilter]=useState("all");
 const [search,setSearch]=useState("");
 const [busy,setBusy]=useState(false);
 const isOpen=(task:Task)=>task.status==="active"||task.status==="published";
 const done=detail.assignments.filter(a=>a.submissions.length>0).length;
 const open=detail.assignments.filter(a=>isOpen(a)&&(!student||!a.submissions.length)).length;
 const tasks=detail.assignments.filter(a=>(filter==="all"||(filter==="todo"?(isOpen(a)&&(!student||!a.submissions.length)):a.submissions.length>0))&&(a.title+" "+a.description).toLowerCase().includes(search.toLowerCase()));
 const current=tasks.find(a=>a.id===active)??(student?tasks.find(a=>!a.submissions.length&&isOpen(a)):undefined)??tasks[0];
 return <section className="mission-planner" aria-label={`${detail.name} assignment planner`}>
 <header className="mission-planner-cover"><div><span className="mission-eyebrow">✦ THE LITTLE MISSION PLANNER</span><h2>One small step at a time.</h2><p>{detail.name} · {student?"Pick a mission, make a plan, and show what you know.":"Your classroom’s missions and student submissions, in one place."}</p></div><div className="mission-progress"><span aria-hidden="true">{student?"✿":"✎"}</span><strong>{done}<small> / {detail.assignments.length}</small></strong><p>{student?"assignments turned in":"assignments with submissions"}</p><progress value={done} max={Math.max(detail.assignments.length,1)} aria-label="Assignments with submissions"/></div></header>
 <div className="mission-planner-strip"><span>○ {open} {student?"to explore":"open missions"}</span><span>✓ {done} {student?"turned in":"with student work"}</span><Link href="/grades">{student?"My grades & feedback":"Open gradebook"} ↗</Link></div>
 <div className="mission-planner-layout"><aside className="mission-sidebar"><label htmlFor="mission-search">Find your next mission</label><input id="mission-search" type="search" value={search} disabled={busy} onChange={e=>setSearch(e.target.value)} placeholder="Search assignments…"/><div className="mission-filters" role="group" aria-label="Filter missions">{[["all","All"],["todo",student?"To do":"Open"],["done",student?"Turned in":"With work"]].map(([id,label])=><button key={id} disabled={busy} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div><nav className="mission-list" aria-label="Assignment missions">{tasks.map((task,index)=><button key={task.id} disabled={busy} className={`mission-list-item ${current?.id===task.id?"active":""}`} aria-pressed={current?.id===task.id} onClick={()=>setActive(task.id)}><span className="mission-number" aria-hidden="true">{task.submissions.length?"✓":String(index+1).padStart(2,"0")}</span><span><strong>{task.title}</strong><small>{task.due_date?`Due ${new Date(task.due_date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}`:"No due date"} · {student?(task.submissions.length?"Turned in":isOpen(task)?"To do":"Closed"):`${task.submissions.length} turned in`}</small></span><span aria-hidden="true">↗</span></button>)}</nav>{!tasks.length&&<p className="mission-empty">{detail.assignments.length?"No missions match. Try another filter or search.":"Your next mission is on its way."}</p>}</aside>
 <div className="mission-workspace"><div className="mission-workspace-heading"><span>YOUR WORKSPACE</span><small>{current?"A little focus goes a long way. ✧":"A fresh page, ready for you."}</small></div>{detail.assignments.map(task=><div hidden={task.id!==current?.id} key={task.id}><AssignmentCard task={task} student={student} classroomId={detail.id} roster={detail.students} onSubmitted={submission=>onSubmitted(task.id,submission)} onBusyChange={setBusy}/></div>)}{!current&&<div className="mission-blank"><span aria-hidden="true">✎</span><h3>Room for your next big idea.</h3><p>Choose a mission from the list to see the instructions and open your workspace.</p></div>}</div></div>
 </section>;
}
function ClassroomAssignmentBoard({detail,student,onSubmitted}:{detail:Detail;student:boolean;onSubmitted:(id:number,s:Submission)=>void}) {
 const [active,setActive]=useState<number|null>(null);
 const [filter,setFilter]=useState("all");
 const [busy,setBusy]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLElement|null>(null);
 const selected=detail.assignments.find(a=>a.id===active);
 const openAssignment=(id:number)=>{if(!detail.assignments.some(a=>a.id===id))return;opener.current=document.activeElement as HTMLElement;setActive(id);};
 const close=()=>{if(busy)return;setActive(null);};
 useEffect(()=>{const handle=(event:Event)=>{const data=(event as CustomEvent<{classroomId:number;assignmentId:number}>).detail;if(data.classroomId===detail.id)openAssignment(data.assignmentId);};window.addEventListener("endowal-open-assignment",handle);return()=>window.removeEventListener("endowal-open-assignment",handle);},[detail.id,detail.assignments]);
 useEffect(()=>{if(active!==null){dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;};}dialog.current?.close();opener.current?.focus();},[active]);
 const isOpen=(a:Task)=>a.status==="active"||a.status==="published";
 const tasks=detail.assignments.filter(a=>filter==="all"|| (student?(filter==="todo"?!a.submissions.length&&isOpen(a):a.submissions.length>0):(filter==="todo"?isOpen(a):!isOpen(a))));
 return <section className="assignment-pinboard" id="classroom-work" aria-label={`${detail.name} assignment board`}>
 <header className="pinboard-header"><div><span className="pinboard-eyebrow">THE ASSIGNMENT CORNER</span><h2>A little work. A lot of possibility.</h2><p>{detail.name} · Pick a paper to open your assignment notebook.</p></div><span className="pinboard-count">{detail.assignments.length}<small>assignments</small></span></header>
 <div className="pinboard-filters" role="group" aria-label="Filter assignments">{[["all","All papers"],["todo",student?"To do":"Open"],["done",student?"Turned in":"Closed & drafts"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}{!student&&<Link href="/grades">Gradebook ↗</Link>}</div>
 <div className="assignment-papers">{tasks.map((task,index)=><button className={`assignment-paper paper-tone-${index%3}`} key={task.id} onClick={()=>openAssignment(task.id)}><span className="paper-tape" aria-hidden="true"/><span className="paper-status">{student?(task.submissions.length?"✓ Turned in":isOpen(task)?"○ To do":"Closed"):`${task.submissions.length} turned in`}</span><h3>{task.title}</h3><p>{task.description}</p><small>{task.due_date?`Due ${new Date(task.due_date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}`:"No due date"}</small><span className="paper-open">{student&&task.submissions.length?"Open my work":"Open notebook"} ↗</span></button>)}</div>
 {!tasks.length&&<p className="pinboard-empty">{detail.assignments.length?"No papers in this pile. Try another filter.":"Your teacher’s next assignment will appear here."}</p>}
 <dialog ref={dialog} className="assignment-notebook" aria-labelledby="assignment-notebook-title" onCancel={event=>{event.preventDefault();close();}} onClose={()=>{if(!busy)setActive(null);}}>
 <header className="notebook-header"><div><span>MY CLASSROOM NOTEBOOK · {detail.name}</span><h2 id="assignment-notebook-title">{selected?.title||"Assignment"}</h2></div><button disabled={busy} onClick={close} aria-label="Close assignment notebook">×</button></header>
 <div className="notebook-body">{detail.assignments.map(task=><div key={task.id} hidden={task.id!==active}><AssignmentCard task={task} student={student} classroomId={detail.id} roster={detail.students} onSubmitted={submission=>onSubmitted(task.id,submission)} onBusyChange={setBusy}/></div>)}</div><footer className="notebook-footer">Your work stays in this notebook while you browse papers in this classroom. Turn it in to save it for your teacher.</footer>
 </dialog>
 </section>;
}
function AssignmentCard({task,student,classroomId,roster,onSubmitted,onBusyChange}:{task:Task;student:boolean;classroomId:number;roster:Detail["students"];onSubmitted:(s:Submission)=>void;onBusyChange?:(busy:boolean)=>void}) {
 const existing=task.submissions[0];const [response,setResponse]=useState(student?existing?.content??"":"");const [saving,setSaving]=useState(false);const [notice,setNotice]=useState("");
 const open=task.status==="active"||task.status==="published";
 const submit=async(event:FormEvent)=>{event.preventDefault();setSaving(true);onBusyChange?.(true);setNotice("");try{const saved=await apiFetch<Submission>(`/learning/assignments/${task.id}/submission`,{method:"PUT",body:JSON.stringify({content:response})});onSubmitted(saved);setNotice("Assignment turned in. Your teacher can now view it.");}catch{setNotice("Unable to turn in your work. Confirm this assignment is still open and try again.");}finally{setSaving(false);onBusyChange?.(false);}};
 return <article className="glass-card classroom-assignment" id={`classroom-assignment-${task.id}`} tabIndex={-1}><div className="card-title"><h2>{task.title}</h2><span className="chip">{student?(existing?"Turned in":open?"To do":"Closed"):`${task.submissions.length} turned in`}</span></div><p className="lesson-copy">{task.description}</p><p className="subtle-text">{task.due_date?`Due ${task.due_date}`:"No due date"} · {task.status}</p>
 {student?<form className="turn-in-form" onSubmit={submit}><label htmlFor={`response-${task.id}`}>Your assignment response</label><textarea id={`response-${task.id}`} required rows={6} maxLength={20000} disabled={saving||!open} value={response} onChange={e=>setResponse(e.target.value)} placeholder="Write your response, show your calculations, and explain your decisions."/>{existing&&<p className="subtle-text">Last turned in: {new Date(existing.submitted_at).toLocaleString()}</p>}<div className="action-row"><button className="primary-btn" disabled={saving||!open||!response.trim()}>{saving?"Turning in…":existing?"Update submission":"Turn in assignment"}</button><Link href={`/bank?classroom=${classroomId}&assignment=${task.id}`} className="ghost-btn">Banking for this assignment</Link><Link href="/grades" className="ghost-btn">View grades</Link></div>{notice&&<p role="status" className="grade-notice">{notice}</p>}</form>:<div className="submission-list">{task.submissions.length?task.submissions.map(s=><details className="list-item" key={s.id}><summary>{roster.find(r=>r.id===s.student_id)?.name??`Student ${s.student_id}`} · Turned in {new Date(s.submitted_at).toLocaleDateString()}</summary><p className="submitted-copy">{s.content}</p><Link className="ghost-btn" href={`/classrooms/${classroomId}/students/${s.student_id}`}>View student dashboard</Link></details>):<p>No submissions yet.</p>}</div>}
 </article>;
}
