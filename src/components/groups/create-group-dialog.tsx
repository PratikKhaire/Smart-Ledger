"use client";

import { useState } from "react";
import { Plus, Users, X, Loader2, AlertCircle } from "lucide-react";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (group: { id: string; name: string }) => void;
}

export default function CreateGroupDialog({ isOpen, onClose, onSuccess }: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create group");

      onSuccess(data.data);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div
        className="animate-slide-up"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(440px, calc(100vw - 32px))",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-elevated)",
          zIndex: 50, overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--accent-purple-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Users size={16} color="var(--accent-purple)" />
            </div>
            <h2 id="create-group-title" style={{ fontSize: 16, fontWeight: 700 }}>Create Group</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="group-name">Group Name *</label>
            <input
              id="group-name"
              className="input"
              type="text"
              placeholder="e.g. Goa Trip 2025, Flatmates, Office Lunch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="group-desc">Description (optional)</label>
            <textarea
              id="group-desc"
              className="input"
              rows={2}
              placeholder="What is this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              style={{ resize: "vertical" }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: "var(--accent-red-dim)", color: "var(--accent-red)",
                fontSize: 13, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: 12, fontSize: 14 }}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Creating…</>
              : <><Plus size={15} />Create Group</>}
          </button>
        </form>
      </div>
    </>
  );
}
