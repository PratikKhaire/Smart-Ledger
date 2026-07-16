"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import {
  CurrencySelector,
  SeedDemoDataCard,
  DangerZoneCard,
  BudgetConfigCard,
  DataExportCard,
  ProfileSettingsCard,
} from "@/components/settings/settings-cards";

export default function SettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <AppShell onAddTransaction={() => setDialogOpen(true)}>
      <div>
        <div className="desktop-only" style={{ flexDirection: "column", gap: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-1.0px", color: "var(--text-primary)", lineHeight: 1.1 }}>
            Settings
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Manage your preferences and app data.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 600,
          }}
        >
          <ProfileSettingsCard />
          <CurrencySelector />
          <BudgetConfigCard />
          <DataExportCard />
          <SeedDemoDataCard />
          <DangerZoneCard />
        </div>
      </div>

      <AddTransactionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </AppShell>
  );
}
