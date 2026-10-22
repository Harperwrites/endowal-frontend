"use client";
import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Task = { id:number; title:string; status:string; submissions:unknown[] };
type Props = {
  onOpenAssignment:(id:number)=>void;
  classroomId:number; name:string; teacherName:string; student:boolean; firstName:string;
  assignments:Task[]; students:{id:number;name:string}[];
};
function DeskArt({color="mint"}:{color?:string}) {
 return <span className={`desk-art desk-${color}`} aria-hidden="true"><span className="desk-chair"/><span className="desk-top"><span className="desk-notebook"/><span className="desk-pencil"/></span><span className="desk-legs"/></span>;
}
export default function ClassroomScene({classroomId,name,teacherName,student,firstName,assignments,students,onOpenAssignment}:Props) {
 const [messageError,setMessageError]=useState("");
 const open = assignments.filter(a=>a.status==="active"||a.status==="published");
 const done = assignments.filter(a=>a.submissions.length>0).length;
 const messageTeacher = async () => {
  setMessageError("");
  try {
   const contacts=await apiFetch<{classroom_id:number;user_id:number}[]>("/messages/contacts");
   const teacher=contacts.find(c=>c.classroom_id===classroomId);
   if(!teacher)throw new Error();
   window.dispatchEvent(new CustomEvent("endowal-message",{detail:{classroomId,partnerId:teacher.user_id}}));
  }catch{setMessageError("Couldn’t open your teacher’s messages. Try the Messages button below.");}
 };
 return <article className="school-room" aria-label={`${name} interactive classroom`}>
  <div className="school-room-wall">
   <div className="room-bunting" aria-hidden="true">{Array.from({length:9},(_,i)=><span key={i}/>)}</div>
   <div className="room-wall-layout">
    <aside className="room-window-corner" aria-hidden="true"><div className="room-window"><i className="room-sun"/><i className="room-cloud"/></div><span className="window-caption">a bright day to grow</span><div className="room-plant"><span>✿</span><i/></div></aside>
    <div className="room-chalkboard"><span className="chalk-eyebrow">ENDOWAL LEARNING CLUB</span><h2>{name}</h2><p>Little lessons. Big dreams. <span aria-hidden="true">✧</span></p><div className="chalk-rule"/><h3>On the board today</h3>{assignments.length?<ul>{assignments.slice(0,3).map(a=><li key={a.id}><button onClick={()=>onOpenAssignment(a.id)}><span className="chalk-check" aria-hidden="true">{student&&a.submissions.length?"✓":"○"}</span><span>{a.title}</span><small>{student?(a.submissions.length?"turned in":a.status==="closed"?"closed":"take a peek →"):`${a.submissions.length} turned in`}</small></button></li>)}</ul>:<p>Your next adventure is on its way.</p>}<a className="chalk-all" href="#classroom-work">View all {assignments.length} assignments ↘</a><div className="chalk-tray" aria-hidden="true"><span/><span/></div></div>
    <aside className="room-noticeboard"><span className="notice-pin" aria-hidden="true"/><span className="room-sticker" aria-hidden="true">✷</span><h3>You belong here.</h3><p>{student?"Bring your ideas, ask questions, and try something new.":"A little encouragement goes a long way."}</p><div className="room-sticky"><strong>{student?`${done} / ${assignments.length}`:students.length}</strong><span>{student?"assignments turned in":"bright minds in this room"}</span></div><small>{open.length} open {open.length===1?"assignment":"assignments"}</small></aside>
   </div>
  </div>
  <div className="school-room-floor">
   <div className="teacher-corner"><div className="teacher-nameplate"><span aria-hidden="true">☕</span><span>{teacherName}<small>{student?"Your teacher · here to help":"Teacher’s corner"}</small></span></div>{student?<button className="room-help-button" onClick={messageTeacher}>Ask a question <span aria-hidden="true">↗</span></button>:<Link className="room-help-button" href="/grades">Open my gradebook ↗</Link>}</div>
   {messageError&&<p role="alert" className="room-message-error">{messageError}</p>}
   <div className="room-seat-label"><span>{student?"Pick a desk. Find your next adventure.":"Every desk has a story."}</span><small>{student?"Your own little learning corners":"Click a student’s desk to view their dashboard & work"}</small></div>
   {student?<div className="room-desks student-learning-desks">
    <a className="room-desk" href="#classroom-work"><DeskArt/><span className="desk-name">{firstName}’s desk <span aria-hidden="true">✦</span></span><small>My assignments</small></a>
    <Link className="room-desk" href={`/bank?classroom=${classroomId}`}><DeskArt color="peach"/><span className="desk-name">Money lab</span><small>Classroom bank & budgets</small></Link>
    <Link className="room-desk" href="/grades"><DeskArt color="lavender"/><span className="desk-name">My progress</span><small>Grades & teacher feedback</small></Link>
    <Link className="room-desk" href="/credit"><DeskArt color="yellow"/><span className="desk-name">Curiosity corner</span><small>Credit lessons & practice</small></Link>
   </div>:<div className="room-desks">{students.map((s,index)=><Link className="room-desk" href={`/classrooms/${classroomId}/students/${s.id}`} key={s.id}><DeskArt color={["mint","peach","lavender","yellow"][index%4]}/><span className="desk-name">{s.name}</span><small>Dashboard & turned-in work ↗</small></Link>)}{!students.length&&<p>No students enrolled yet. Their desks will appear here when they join.</p>}</div>}
   <footer className="room-footer"><span aria-hidden="true">✿</span> A little practice today. A little more confidence tomorrow. <span aria-hidden="true">✿</span></footer>
  </div>
 </article>;
}
