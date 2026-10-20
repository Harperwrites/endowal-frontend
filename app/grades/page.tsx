"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "../components/Session";

type Grade = {
  id: number; assignment_id: number; assignment_title: string;
  classroom_id: number; classroom_name: string; student_id: number;
  student_name: string; points_earned: string; points_possible: string;
  feedback: string | null; updated_at: string;
};
type Classroom = { id: number; name: string };
type Roster = { students: { id: number; name: string }[]; assignments: { id: number; title: string }[] };
const percent = (earned: number, possible: number) => possible > 0
  ? `${(earned / possible * 100).toFixed(1)}%` : "—";
// Sum whole hundredths so decimal points cannot accumulate floating-point error.
const hundredths = (value: string) => Math.round(Number(value) * 100);
const displayPoints = (value: string) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
function message(error: unknown) {
  if (!(error instanceof Error)) return "Something went wrong. Please try again.";
  try { const body = JSON.parse(error.message); if (typeof body.detail === "string") return body.detail; } catch {}
  return "Unable to complete this request. Check the fields and try again.";
}

export default function GradesPage() {
  const { user, loading } = useSession();
  if (loading) return <section className="page-shell">Loading account…</section>;
  if (!user) return <section className="page-shell"><h1>Grades</h1><Link href="/auth" className="ghost-btn">Sign in to view grades</Link></section>;
  return <Gradebook key={user.id} user={user} />;
}

function Gradebook({ user }: { user: { id: number; name: string; role: string } }) {
  const student = user.role === "student";
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomId, setClassroomId] = useState("");
  const [roster, setRoster] = useState<Roster>({ students: [], assignments: [] });
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studentId, setStudentId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [earned, setEarned] = useState("");
  const [possible, setPossible] = useState("100");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [rosterReady, setRosterReady] = useState(false);

  useEffect(() => {
    if (student) return;
    let active = true;
    apiFetch<Classroom[]>(`/classrooms?limit=1000${user.role === "teacher" ? `&teacher_id=${user.id}` : ""}`)
      .then(data => { if (active) { setClassrooms(data); setClassroomId(previous => data.some(c => String(c.id) === previous) ? previous : String(data[0]?.id ?? "")); if (!data.length) setPending(false); } })
      .catch(err => { if (active) { setError(message(err)); setPending(false); } });
    return () => { active = false; };
  }, [student, user.id, user.role, revision]);

  useEffect(() => {
    if (student || !classroomId) return;
    let active = true;
    setRosterReady(false); setRoster({ students: [], assignments: [] });
    setStudentId(""); setAssignmentId(""); setNotice("");
    apiFetch<Roster>(`/grades/roster?classroom_id=${classroomId}`).then(data => {
      if (!active) return;
      setRoster(data); setStudentId(String(data.students[0]?.id ?? ""));
      setAssignmentId(String(data.assignments[0]?.id ?? "")); setRosterReady(true);
    }).catch(err => { if (active) setError(message(err)); });
    return () => { active = false; };
  }, [student, classroomId, revision]);

  useEffect(() => {
    if (!student && !classroomId) return;
    let active = true; let busy = false;
    setPending(true); setGrades([]); setError("");
    const refresh = async () => {
      if (busy) return; busy = true;
      try {
        const data = await apiFetch<Grade[]>(`/grades${student ? "" : `?classroom_id=${classroomId}`}`);
        if (active) { setGrades(data); setError(""); }
      } catch (err) { if (active) setError(message(err)); }
      finally { busy = false; if (active) setPending(false); }
    };
    refresh();
    const interval = student ? window.setInterval(refresh, 15000) : undefined;
    if (student) window.addEventListener("focus", refresh);
    return () => { active = false; if (interval) window.clearInterval(interval); window.removeEventListener("focus", refresh); };
  }, [student, classroomId, revision]);

  const existing = grades.find(g => g.student_id === Number(studentId) && g.assignment_id === Number(assignmentId));
  useEffect(() => {
    setEarned(existing?.points_earned ?? ""); setPossible(existing?.points_possible ?? "100");
    setFeedback(existing?.feedback ?? "");
  }, [existing, studentId, assignmentId]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!earned.trim() || !possible.trim() || !Number.isFinite(Number(earned)) || !Number.isFinite(Number(possible)) || Number(earned) < 0 || Number(possible) <= 0 || Number(earned) > Number(possible)) {
      setError("Enter points earned between zero and the points possible. Points possible must be greater than zero."); return;
    }
    setSaving(true);
    try {
      await apiFetch("/grades", { method: "PUT", body: JSON.stringify({ assignment_id: Number(assignmentId), student_id: Number(studentId), points_earned: earned, points_possible: possible, feedback: feedback || null }) });
      setNotice("Grade saved. The student can now view it.");
      try { setGrades(await apiFetch<Grade[]>(`/grades?classroom_id=${classroomId}`)); }
      catch { setError("The grade was saved, but the list could not refresh. Use Refresh grades to reload it."); }
    } catch (err) { setError(message(err)); }
    finally { setSaving(false); }
  };
  const totalEarned = grades.reduce((sum, g) => sum + hundredths(g.points_earned), 0);
  const totalPossible = grades.reduce((sum, g) => sum + hundredths(g.points_possible), 0);

  return <section className="page-shell">
    <header className="bank-heading"><div><span className="tag">{student ? "Student gradebook" : "Teacher gradebook"}</span><h1>{student ? "My grades" : "Classroom grades"}</h1><p className="subtle-text">{student ? "Your assignment results and teacher feedback. Updates every 15 seconds." : "Record assignment scores and share feedback with your students."}</p></div><button className="ghost-btn" disabled={saving || pending} onClick={() => setRevision(r => r + 1)}>Refresh grades</button></header>
    {error && <div className="grade-notice" role="alert">{error}</div>}
    {notice && <div className="grade-notice" role="status">{notice}</div>}
    {student ? <div className="grid-three"><article className="glass-card"><div className="section-title">Overall grade · total points</div><div className="balance-amount">{pending ? "…" : percent(totalEarned, totalPossible)}</div><p className="subtle-text">{totalEarned / 100} / {totalPossible / 100} points earned</p><p className="footer-note">Uses graded assignments only. Ungraded work is not counted as zero. No category weights are applied.</p></article><article className="glass-card"><div className="section-title">Graded assignments</div><div className="balance-amount">{pending ? "…" : grades.length}</div><p className="subtle-text">Only grades saved for your account appear here.</p></article></div> : <>
      <div className="glass-card grade-filter"><label htmlFor="grades-classroom">Classroom</label><select id="grades-classroom" value={classroomId} disabled={saving} onChange={e => { setClassroomId(e.target.value); setError(""); }}><option value="" disabled>Select a classroom</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{!pending && !classrooms.length && <p>No classrooms available. Create a classroom and enroll students before entering grades.</p>}</div>
      {classroomId && <form className="form-card grade-form" onSubmit={save}><h2>{existing ? "Update grade" : "Enter grade"}</h2><p>Saved grades are immediately visible to the selected student.</p><fieldset disabled={saving || !rosterReady || pending}>
        <div className="form-row"><div><label htmlFor="grade-student">Student</label><select required id="grade-student" value={studentId} onChange={e => { setStudentId(e.target.value); setNotice(""); }}><option value="" disabled>Select student</option>{roster.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label htmlFor="grade-assignment">Assignment</label><select required id="grade-assignment" value={assignmentId} onChange={e => { setAssignmentId(e.target.value); setNotice(""); }}><option value="" disabled>Select assignment</option>{roster.assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div></div>
        <div className="form-row"><div><label htmlFor="grade-earned">Points earned</label><input required id="grade-earned" type="number" min="0" max={possible || undefined} step="0.01" value={earned} onChange={e => setEarned(e.target.value)} placeholder="85" /></div><div><label htmlFor="grade-possible">Points possible</label><input required id="grade-possible" type="number" min="0.01" max="99999999.99" step="0.01" value={possible} onChange={e => setPossible(e.target.value)} /></div></div>
        <label htmlFor="grade-feedback">Feedback (optional)</label><textarea id="grade-feedback" maxLength={5000} rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Share what went well and what to work on next." />
        <div className="grade-preview">Score: {earned.trim() && possible.trim() ? percent(Number(earned), Number(possible)) : "—"}</div>
        <button className="primary-btn" type="submit" disabled={!studentId || !assignmentId}>{saving ? "Saving…" : existing ? "Save changes" : "Save grade"}</button>
      </fieldset>{rosterReady && (!roster.students.length || !roster.assignments.length) && <p>Add an assignment and enroll active students in this classroom to enter grades.</p>}</form>}
    </>}
    <article className="glass-card"><h2>{student ? "Assignment results" : "Saved grades"}</h2>{pending ? <p role="status">Loading grades…</p> : grades.length === 0 ? <p>{student ? "No grades yet. Your teacher’s saved grades will appear here." : "No grades saved for this classroom yet."}</p> : <div className="report-table-wrap"><table className="report-table"><thead><tr>{!student && <th>Student</th>}<th>Assignment</th>{student && <th>Classroom</th>}<th>Points</th><th>Percentage</th><th>Feedback</th>{!student && <th>Edit</th>}</tr></thead><tbody>{grades.map(g => <tr key={g.id}>{!student && <td>{g.student_name}</td>}<td>{g.assignment_title}</td>{student && <td>{g.classroom_name}</td>}<td>{displayPoints(g.points_earned)} / {displayPoints(g.points_possible)}</td><td>{percent(hundredths(g.points_earned), hundredths(g.points_possible))}</td><td className="grade-feedback">{g.feedback || "No feedback added."}</td>{!student && <td><button className="ghost-btn" disabled={saving} onClick={() => { setStudentId(String(g.student_id)); setAssignmentId(String(g.assignment_id)); setNotice(""); document.getElementById("grade-earned")?.focus(); }}>Edit<span className="sr-only"> grade for {g.student_name}, {g.assignment_title}</span></button></td>}</tr>)}</tbody></table></div>}</article>
  </section>;
}
