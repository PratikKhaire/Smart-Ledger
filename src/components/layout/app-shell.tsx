"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  Wallet,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

export default function AppShell({ children, onAddTransaction }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("smart-ledger-theme") as
      | "dark"
      | "light"
      | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("smart-ledger-theme", next);
  };

  const currentPage =
    NAV_ITEMS.find((item) => item.href === pathname)?.label || "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hide-mobile"
        style={{
          width: 260,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-primary)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wallet size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
              Smart Ledger
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Mini Finance Tracker
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Add Transaction Button */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border-primary)" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={onAddTransaction}
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          marginLeft: 260,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
        className="main-content"
      >
        {/* Top bar */}
        <header
          className="glass"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile menu button */}
            <button
              className="btn btn-ghost btn-icon show-mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 600 }}>{currentPage}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="btn btn-primary btn-sm show-mobile-only"
              onClick={onAddTransaction}
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="page-enter"
          style={{ flex: 1, padding: "24px", maxWidth: 1200, width: "100%", margin: "0 auto" }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="show-mobile-only"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-primary)",
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 0",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
          zIndex: 30,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--accent-blue)" : "var(--text-muted)",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div className="overlay show-mobile-only" onClick={() => setMobileMenuOpen(false)} />
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding-bottom: 80px;
          }
        }
      `}</style>
    </div>
  );
}
