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
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Share2,
  Mail,
  Award,
  Briefcase,
  FileText,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const HexagonLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 7V17L12 22L20 17V7L12 2z" fill="currentColor" />
    <circle cx="12" cy="12" r="3.5" fill="var(--bg-secondary)" />
  </svg>
);

const NAV_GROUPS = [
  {
    title: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, isReal: true },
      { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, isReal: true },
      { href: "/analytics", label: "Analytics", icon: BarChart3, isReal: true },
    ]
  },
  {
    title: "Preferences",
    items: [
      { href: "/settings", label: "Settings", icon: Settings, isReal: true }
    ]
  }
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
    } else {
      // Default to light theme if we want it to look exactly like the screenshot
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("smart-ledger-theme", next);
  };

  const currentPage = NAV_GROUPS
    .flatMap((group) => group.items)
    .find((item) => item.href === pathname && item.isReal)?.label || "Dashboard";

  return (
    <div className="app-container">
      {/* Outer App Frame */}
      <div className="app-frame">
        
        {/* Desktop Sidebar */}
        <aside className="sidebar hide-mobile">
          {/* Logo */}
          <div className="sidebar-logo-section">
            <div className="logo-icon-container">
              <HexagonLogo />
            </div>
            <span className="logo-text">Mantra</span>
          </div>

          {/* User Profile Pill */}
          <div className="profile-pill">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
              alt="Amanda Smith"
              className="profile-avatar"
            />
            <div className="profile-info">
              <div className="profile-name">Amanda Smith</div>
              <div className="profile-sub">Professional Account</div>
            </div>
            <ChevronRight size={14} className="profile-arrow" />
          </div>

          {/* Navigation Groups */}
          <div className="sidebar-nav-scroll">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="nav-group">
                <div className="nav-group-title">{group.title}</div>
                <div className="nav-group-items">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href && item.isReal;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.isReal ? item.href : "#"}
                        onClick={(e) => {
                          if (!item.isReal) {
                            e.preventDefault();
                          }
                        }}
                        className={cn(
                          "nav-item",
                          isActive && "nav-item-active",
                          !item.isReal && "nav-item-dummy"
                        )}
                      >
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="nav-item-label">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Transaction Button at bottom */}
          {onAddTransaction && (
            <div className="sidebar-footer">
              <button
                className="btn btn-primary"
                style={{ width: "100%", borderRadius: "10px", fontSize: "13px", height: "38px" }}
                onClick={onAddTransaction}
              >
                <Plus size={16} />
                Add Transaction
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="main-content-area">
          {/* Top Header Bar */}
          <header className="app-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Mobile menu button */}
              <button
                className="btn btn-ghost btn-icon show-mobile-only"
                style={{ color: "var(--text-primary)" }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="header-title">{currentPage}</h1>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-ghost btn-icon"
                style={{ color: "var(--text-secondary)" }}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {onAddTransaction && (
                <button
                  className="btn btn-primary btn-sm show-mobile-only"
                  style={{ borderRadius: "8px" }}
                  onClick={onAddTransaction}
                >
                  <Plus size={14} />
                  Add
                </button>
              )}
            </div>
          </header>

          {/* Page content scroll container */}
          <main className="page-enter content-canvas">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation bar */}
        <nav className="mobile-bottom-nav show-mobile-only">
          {NAV_GROUPS.flatMap((group) => group.items)
            .filter((item) => item.isReal)
            .map((item) => {
              const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mobile-nav-item",
                  isActive && "mobile-nav-item-active"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Overlay Menu Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-overlay show-mobile-only" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <div className="sidebar-logo-section">
                  <div className="logo-icon-container">
                    <HexagonLogo />
                  </div>
                  <span className="logo-text">Mantra</span>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Profile Pill in mobile drawer */}
              <div className="profile-pill" style={{ margin: "0 16px 16px 16px" }}>
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                  alt="Amanda Smith"
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <div className="profile-name">Amanda Smith</div>
                  <div className="profile-sub">Professional Account</div>
                </div>
                <ChevronRight size={14} className="profile-arrow" />
              </div>

              <div className="sidebar-nav-scroll" style={{ padding: "0 16px" }}>
                {NAV_GROUPS.map((group) => (
                  <div key={group.title} className="nav-group" style={{ marginBottom: 16 }}>
                    <div className="nav-group-title">{group.title}</div>
                    <div className="nav-group-items">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href && item.isReal;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.isReal ? item.href : "#"}
                            onClick={(e) => {
                              if (!item.isReal) {
                                e.preventDefault();
                              } else {
                                setMobileMenuOpen(false);
                              }
                            }}
                            className={cn(
                              "nav-item",
                              isActive && "nav-item-active",
                              !item.isReal && "nav-item-dummy"
                            )}
                          >
                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="nav-item-label">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
