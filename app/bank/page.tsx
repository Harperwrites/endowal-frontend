"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { apiFetch, clearToken, fetchMe } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
};

type Classroom = {
  id: number;
  teacher_id: number;
  name: string;
  school_name?: string | null;
  grade_level?: string | null;
};

type Enrollment = {
  id: number;
  classroom_id: number;
  student_id: number;
  status: string;
};

type Wallet = {
  id: number;
  classroom_id: number;
  student_id: number;
  balance: number;
};

type LedgerEntry = {
  id: number;
  wallet_id: number;
  assignment_id?: number | null;
  amount: number;
  entry_type: string;
  source: string;
  memo?: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const BankPage = () => {
  const [me, setMe] = useState<User | null>(null);
  const [status, setStatus] = useState("Loading banking workspace...");

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(
    null
  );
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  const [entryType, setEntryType] = useState<"deposit" | "withdrawal">(
    "deposit"
  );
  const [entryAmount, setEntryAmount] = useState("");
  const [entryMemo, setEntryMemo] = useState("");

  const [transferWalletId, setTransferWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMemo, setTransferMemo] = useState("");

  const [createWalletStudentId, setCreateWalletStudentId] = useState("");
  const [createWalletBalance, setCreateWalletBalance] = useState("");

  const [actionNotice, setActionNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWalletId) ?? null,
    [wallets, selectedWalletId]
  );

  const ledgerSorted = useMemo(
    () => [...ledgerEntries].sort((a, b) => b.id - a.id),
    [ledgerEntries]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchMe();
        setMe(response as User);
        setStatus("Ready for classroom banking.");
      } catch (error) {
        setStatus("Session expired. Please sign in again.");
        clearToken();
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!me) return;
    const loadClassrooms = async () => {
      try {
        if (me.role === "teacher" || me.role === "admin") {
          const data = await apiFetch<Classroom[]>(
            `/classrooms?teacher_id=${me.id}`
          );
          setClassrooms(data);
          setSelectedClassroomId(data[0]?.id ?? null);
          return;
        }
        const studentEnrollments = await apiFetch<Enrollment[]>(
          `/enrollments?student_id=${me.id}`
        );
        setEnrollments(studentEnrollments);
        const classroomIds = [
          ...new Set(studentEnrollments.map((enrollment) => enrollment.classroom_id))
        ];
        const classroomResults = await Promise.all(
          classroomIds.map((classroomId) =>
            apiFetch<Classroom>(`/classrooms/${classroomId}`)
          )
        );
        setClassrooms(classroomResults);
        setSelectedClassroomId(classroomResults[0]?.id ?? null);
      } catch (error) {
        setStatus("Unable to load classroom banking.");
      }
    };
    loadClassrooms();
  }, [me]);

  useEffect(() => {
    if (!me || !selectedClassroomId) {
      setWallets([]);
      setSelectedWalletId(null);
      return;
    }
    const loadWallets = async () => {
      try {
        const data = await apiFetch<Wallet[]>(
          `/wallets?classroom_id=${selectedClassroomId}`
        );
        setWallets(data);
        setSelectedWalletId(data[0]?.id ?? null);
      } catch (error) {
        setActionNotice("Unable to load wallets.");
      }
    };
    loadWallets();
  }, [me, selectedClassroomId]);

  useEffect(() => {
    if (!me || !selectedClassroomId || me.role === "student") return;
    const loadEnrollments = async () => {
      try {
        const data = await apiFetch<Enrollment[]>(
          `/enrollments?classroom_id=${selectedClassroomId}`
        );
        setEnrollments(data);
      } catch (error) {
        setEnrollments([]);
      }
    };
    loadEnrollments();
  }, [me, selectedClassroomId]);

  useEffect(() => {
    if (!selectedWalletId) {
      setLedgerEntries([]);
      return;
    }
    const loadLedger = async () => {
      try {
        const data = await apiFetch<LedgerEntry[]>(
          `/ledger-entries?wallet_id=${selectedWalletId}&limit=200`
        );
        setLedgerEntries(data);
      } catch (error) {
        setActionNotice("Unable to load account statements.");
      }
    };
    loadLedger();
  }, [selectedWalletId]);

  const handleLedgerEntry = async () => {
    if (!selectedWalletId) return;
    const amount = Number(entryAmount);
    if (!amount || amount <= 0) {
      setActionNotice("Enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<LedgerEntry>("/ledger-entries", {
        method: "POST",
        body: JSON.stringify({
          wallet_id: selectedWalletId,
          assignment_id: null,
          amount,
          entry_type: entryType,
          source: me?.role === "student" ? "student_action" : "teacher_grant",
          memo: entryMemo || null
        })
      });
      setEntryAmount("");
      setEntryMemo("");
      setActionNotice("Entry recorded.");
      const refreshed = await apiFetch<LedgerEntry[]>(
        `/ledger-entries?wallet_id=${selectedWalletId}&limit=200`
      );
      setLedgerEntries(refreshed);
      const updatedWallets = await apiFetch<Wallet[]>(
        `/wallets?classroom_id=${selectedClassroomId}`
      );
      setWallets(updatedWallets);
    } catch (error) {
      setActionNotice("Unable to post entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedWalletId) return;
    const amount = Number(transferAmount);
    const toWalletId = Number(transferWalletId);
    if (!toWalletId || !amount) {
      setActionNotice("Add a recipient wallet and amount.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/wallets/transfer", {
        method: "POST",
        body: JSON.stringify({
          from_wallet_id: selectedWalletId,
          to_wallet_id: toWalletId,
          amount,
          memo: transferMemo || "Peer transfer"
        })
      });
      setTransferAmount("");
      setTransferMemo("");
      setTransferWalletId("");
      setActionNotice("Transfer completed.");
      const refreshed = await apiFetch<LedgerEntry[]>(
        `/ledger-entries?wallet_id=${selectedWalletId}&limit=200`
      );
      setLedgerEntries(refreshed);
      const updatedWallets = await apiFetch<Wallet[]>(
        `/wallets?classroom_id=${selectedClassroomId}`
      );
      setWallets(updatedWallets);
    } catch (error) {
      setActionNotice("Transfer failed. Check wallet IDs.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!selectedClassroomId) return;
    const studentId = Number(createWalletStudentId);
    const balance = Number(createWalletBalance || 0);
    if (!studentId) {
      setActionNotice("Enter a student ID.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<Wallet>("/wallets", {
        method: "POST",
        body: JSON.stringify({
          classroom_id: selectedClassroomId,
          student_id: studentId,
          balance
        })
      });
      setCreateWalletStudentId("");
      setCreateWalletBalance("");
      setActionNotice("Wallet created with Wealth Builder bucket.");
      const refreshed = await apiFetch<Wallet[]>(
        `/wallets?classroom_id=${selectedClassroomId}`
      );
      setWallets(refreshed);
    } catch (error) {
      setActionNotice("Unable to create wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStatement = () => {
    if (!selectedWallet || ledgerSorted.length === 0) return;
    const header = ["ID", "Type", "Amount", "Source", "Memo"];
    const rows = ledgerSorted.map((entry) => [
      entry.id,
      entry.entry_type,
      entry.amount,
      entry.source,
      entry.memo ?? ""
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `endowal-statement-wallet-${selectedWallet.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page-shell">
      <div className="hero">
        <div className="hero-card fade-in">
          <h1>Endowal Bank Desk</h1>
          <p>
            Issue classroom wallets, track student deposits, and keep clean
            statements ready for teacher review.
          </p>
          <div className="tag">{status}</div>
        </div>
        <div className="glass-card fade-in fade-delay-1">
          <div className="section-title">Classroom Focus</div>
          <p className="subtle-text">
            Select a classroom to view wallets and banking activity.
          </p>
          <select
            value={selectedClassroomId ?? ""}
            onChange={(event) =>
              setSelectedClassroomId(Number(event.target.value))
            }
          >
            <option value="" disabled>
              Select classroom
            </option>
            {classrooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          {selectedClassroomId ? (
            <p className="subtle-text">
              {wallets.length} wallets ·{" "}
              {ledgerEntries.length} statements on file
            </p>
          ) : (
            <p className="subtle-text">No classrooms available yet.</p>
          )}
        </div>
      </div>

      <div className="bank-grid">
        <div className="glass-card fade-in fade-delay-2">
          <div className="section-title">Student Wallets</div>
          {wallets.length === 0 ? (
            <p className="subtle-text">No wallets yet for this class.</p>
          ) : (
            <div className="card-list">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  className={`list-item ${
                    wallet.id === selectedWalletId ? "active" : ""
                  }`}
                  onClick={() => setSelectedWalletId(wallet.id)}
                >
                  <div className="card-title">
                    <strong>Wallet #{wallet.id}</strong>
                    <span className="chip">Student {wallet.student_id}</span>
                  </div>
                  <p className="subtle-text">
                    Balance: {formatCurrency(wallet.balance)}
                  </p>
                  <p className="subtle-text">Classroom ID: {wallet.classroom_id}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-card fade-in fade-delay-2">
          <div className="card-title">
            <strong>Deposit or Withdraw</strong>
            {selectedWallet ? (
              <span className="chip">Wallet #{selectedWallet.id}</span>
            ) : null}
          </div>
          <label>Entry type</label>
          <select
            value={entryType}
            onChange={(event) =>
              setEntryType(event.target.value as "deposit" | "withdrawal")
            }
          >
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
          <label>Amount</label>
          <input
            value={entryAmount}
            onChange={(event) => setEntryAmount(event.target.value)}
            placeholder="50"
          />
          <label>Memo</label>
          <input
            value={entryMemo}
            onChange={(event) => setEntryMemo(event.target.value)}
            placeholder="Savings challenge"
          />
          <button
            className="primary-btn"
            type="button"
            onClick={handleLedgerEntry}
            disabled={loading || !selectedWalletId}
          >
            {loading ? "Working..." : "Record entry"}
          </button>
          {me?.role === "student" ? (
            <p className="footer-note">
              Student deposits and withdrawals appear instantly on statements.
            </p>
          ) : (
            <p className="footer-note">
              Teacher-issued deposits show as grants on student statements.
            </p>
          )}
        </div>

        <div className="form-card fade-in fade-delay-2">
          <div className="card-title">
            <strong>Peer Transfer</strong>
            <span className="chip">Same classroom</span>
          </div>
          <label>Recipient wallet ID</label>
          <input
            value={transferWalletId}
            onChange={(event) => setTransferWalletId(event.target.value)}
            placeholder="Wallet ID"
          />
          <label>Amount</label>
          <input
            value={transferAmount}
            onChange={(event) => setTransferAmount(event.target.value)}
            placeholder="20"
          />
          <label>Memo</label>
          <input
            value={transferMemo}
            onChange={(event) => setTransferMemo(event.target.value)}
            placeholder="Group project payment"
          />
          <button
            className="primary-btn"
            type="button"
            onClick={handleTransfer}
            disabled={loading || !selectedWalletId}
          >
            Send transfer
          </button>
          <p className="footer-note">
            Students can send to classmates with the wallet ID listed above.
          </p>
        </div>
      </div>

      <div className="bank-grid">
        {me?.role !== "student" ? (
          <div className="form-card fade-in fade-delay-3">
            <div className="card-title">
              <strong>Create Student Wallet</strong>
              <span className="chip">Teacher only</span>
            </div>
            <label>Student ID</label>
            <input
              value={createWalletStudentId}
              onChange={(event) => setCreateWalletStudentId(event.target.value)}
              placeholder="Student user ID"
            />
            <label>Starting balance</label>
            <input
              value={createWalletBalance}
              onChange={(event) => setCreateWalletBalance(event.target.value)}
              placeholder="0"
            />
            <button
              className="primary-btn"
              type="button"
              onClick={handleCreateWallet}
              disabled={loading || !selectedClassroomId}
            >
              Create wallet
            </button>
            <p className="footer-note">
              Every new wallet includes a Wealth Builder bucket automatically.
            </p>
            {enrollments.length > 0 ? (
              <p className="footer-note">
                Active students:{" "}
                {enrollments.map((entry) => entry.student_id).join(", ")}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="glass-card fade-in fade-delay-3">
            <div className="section-title">Need a wallet?</div>
            <p className="subtle-text">
              Ask your teacher to create your classroom wallet if you don&apos;t
              see one listed.
            </p>
          </div>
        )}

        <div className="glass-card fade-in fade-delay-3">
          <div className="section-title">Account Statement</div>
          {selectedWallet ? (
            <div>
              <p className="subtle-text">
                Wallet #{selectedWallet.id} · Statement entries:{" "}
                {ledgerSorted.length}
              </p>
              {ledgerSorted.length === 0 ? (
                <p className="subtle-text">No entries yet.</p>
              ) : (
                <div className="card-list">
                  {ledgerSorted.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="list-item">
                      <div className="card-title">
                        <strong>{entry.entry_type}</strong>
                        <span className="chip">
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                      <p className="subtle-text">
                        {entry.memo || "No memo"} · {entry.source}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="action-row">
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={handleDownloadStatement}
                  disabled={ledgerSorted.length === 0}
                >
                  Download statement
                </button>
                <Link className="ghost-btn" href="/dashboard">
                  Back to dashboard
                </Link>
              </div>
              <p className="footer-note">
                Export statements to share with teachers for grading or review.
              </p>
            </div>
          ) : (
            <p className="subtle-text">
              Select a wallet to view statements.
            </p>
          )}
        </div>
      </div>

      {actionNotice ? <div className="tag">{actionNotice}</div> : null}
    </section>
  );
};

export default BankPage;
