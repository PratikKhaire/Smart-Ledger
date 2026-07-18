"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, AlertCircle, Loader2, CheckCircle, LogIn } from "lucide-react";

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [preview, setPreview] = useState<{
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    createdBy: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/groups/join/${inviteCode}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) setError(res.error);
        else setPreview(res.data);
      })
      .catch(() => setError("Invalid invite link."))
      .finally(() => setIsLoading(false));
  }, [inviteCode]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/groups/join/${inviteCode}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // Not logged in — redirect to login
          router.push(`/login?redirect=/join/${inviteCode}`);
          return;
        }
        throw new Error(data.error || "Failed to join");
      }
      setJoined(true);
      setTimeout(() => router.push(`/groups/${data.data.group.id}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-outer)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {isLoading && (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} color="var(--accent-purple)" />
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading invite…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <AlertCircle size={40} color="var(--accent-red)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Invalid Invite</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>{error}</p>
            <Link href="/" className="btn btn-primary btn-sm">Go to Dashboard</Link>
          </div>
        )}

        {!isLoading && !error && preview && !joined && (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "var(--accent-purple-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Users size={28} color="var(--accent-purple)" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
                You're invited!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                <strong>{preview.createdBy}</strong> invited you to join a group
              </p>
            </div>

            <div
              style={{
                padding: 20, background: "var(--bg-elevated)",
                borderRadius: 12, border: "1px solid var(--border-primary)",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{preview.name}</div>
              {preview.description && (
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 10 }}>
                  {preview.description}
                </div>
              )}
              <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={13} />
                {preview.memberCount} member{preview.memberCount !== 1 ? "s" : ""}
              </div>
            </div>

            {error && (
              <div className="auth-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={14} />{error}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: 13, fontSize: 15 }}
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />Joining…</>
              ) : (
                <><LogIn size={16} />Join Group</>
              )}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
              You need to be signed in. If you're not,{" "}
              <Link href={`/login?redirect=/join/${inviteCode}`} style={{ color: "var(--accent-purple)", fontWeight: 600 }}>
                sign in first
              </Link>
            </p>
          </div>
        )}

        {joined && (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <CheckCircle size={48} color="var(--accent-green)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>You're in!</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting to the group…</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
