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
      { href: "#", label: "Projects", icon: FolderKanban, isReal: false },
      { href: "#", label: "Tasks", icon: CheckSquare, isReal: false },
      { href: "#", label: "Clients", icon: Users, isReal: false },
      { href: "#", label: "Messages", icon: MessageSquare, isReal: false },
    ]
  },
  {
    title: "Leads",
    items: [
      { href: "#", label: "Social Medias", icon: Share2, isReal: false },
      { href: "#", label: "Email", icon: Mail, isReal: false },
      { href: "#", label: "Affiliates", icon: Award, isReal: false },
      { href: "#", label: "Job Board", icon: Briefcase, isReal: false },
    ]
  },
  {
    title: "Payments",
    items: [
      { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, isReal: true },
      { href: "/analytics", label: "Analytics", icon: BarChart3, isReal: true },
      { href: "#", label: "Invoices", icon: FileText, isReal: false },
      { href: "#", label: "Expenses", icon: CreditCard, isReal: false },
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
          {NAV_GROUPS[0].items.filter(i => i.isReal).concat(
            NAV_GROUPS[2].items.filter(i => i.isReal),
            NAV_GROUPS[3].items.filter(i => i.isReal)
          ).map((item) => {
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

      <style jsx global>{`
        /* Global Redesigned Layout CSS */
        .app-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-outer);
          padding: 28px;
          box-sizing: border-box;
        }

        .app-frame {
          display: flex;
          width: 100%;
          max-width: 1300px;
          background-color: var(--bg-primary);
          border-radius: var(--radius-xxl);
          overflow: hidden;
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-card);
          margin: 0 auto;
          position: relative;
        }

        /* Sidebar Styling */
        .sidebar {
          width: 270px;
          flex-shrink: 0;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          padding: 32px 20px;
        }

        .sidebar-logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-left: 4px;
        }

        .logo-icon-container {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background-color: #18181b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        [data-theme="dark"] .logo-icon-container {
          background-color: #ffffff;
          color: #18181b;
        }

        .logo-text {
          font-weight: 800;
          font-size: 19px;
          color: var(--text-primary);
          letter-spacing: -0.6px;
        }

        /* Profile Pill Styling */
        .profile-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          background-color: var(--bg-card);
          margin-bottom: 28px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .profile-pill:hover {
          border-color: var(--border-hover);
          background-color: var(--bg-card-hover);
        }

        .profile-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .profile-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-sub {
          font-size: 10px;
          color: var(--text-muted);
          line-height: 1.2;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-arrow {
          color: var(--text-muted);
        }

        /* Sidebar Navigation Groups */
        .sidebar-nav-scroll {
          flex: 1;
          overflow-y: auto;
          margin-right: -8px;
          padding-right: 8px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-nav-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .nav-group-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 8px;
          padding-left: 12px;
        }

        .nav-group-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* Nav Item Link Styling */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .nav-item:hover:not(.nav-item-dummy) {
          background-color: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .nav-item-active {
          background-color: var(--accent-purple-dim) !important;
          color: var(--accent-purple) !important;
          font-weight: 700;
        }

        [data-theme="light"] .nav-item-active {
          background-color: #f3e8ff !important;
          color: #6d28d9 !important;
        }

        .nav-item-dummy {
          color: rgba(140, 140, 160, 0.45);
          cursor: default;
        }

        .nav-item-label {
          flex: 1;
        }

        .sidebar-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border-primary);
        }

        /* Main Content Container Scroll styling */
        .main-content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 56px);
          overflow-y: auto;
          background-color: var(--bg-primary);
        }

        .app-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 32px 32px 0 32px;
          background-color: transparent;
        }

        .header-title {
          display: none !important;
        }

        .content-canvas {
          flex: 1;
          padding: 12px 32px 40px 32px;
          width: 100%;
          max-width: 1100px;
        }

        /* Mobile styling overrides */
        @media (max-width: 768px) {
          .app-header {
            justify-content: space-between !important;
            padding: 14px 16px !important;
          }
          
          .header-title {
            display: block !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            letter-spacing: -0.3px !important;
          }
          .app-container {
            padding: 0;
          }

          .app-frame {
            border-radius: 0;
            border: none;
            box-shadow: none;
          }

          .main-content-area {
            height: auto;
            overflow-y: visible;
            padding-bottom: 80px;
          }

          .app-header {
            border-bottom: 1px solid var(--border-primary);
            background-color: var(--bg-secondary);
            padding: 14px 16px;
            position: sticky;
            top: 0;
            z-index: 20;
          }

          .header-title {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.3px;
          }

          .content-canvas {
            padding: 16px;
          }

          .mobile-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--bg-secondary);
            border-top: 1px solid var(--border-primary);
            display: flex;
            justify-content: space-around;
            padding: 8px 0;
            padding-bottom: calc(8px + env(safe-area-inset-bottom));
            z-index: 30;
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            font-size: 10px;
            font-weight: 500;
            color: var(--text-muted);
            text-decoration: none;
            transition: color var(--transition-fast);
          }

          .mobile-nav-item-active {
            color: var(--accent-purple);
          }

          /* Mobile Overlay menu drawer */
          .mobile-drawer-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 50;
            display: flex;
            justify-content: flex-start;
          }

          .mobile-drawer {
            width: 280px;
            height: 100%;
            background-color: var(--bg-secondary);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            padding: 16px 0;
            animation: slideInLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }

          .mobile-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}
