"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import {
  CurrencySelector,
  SeedDemoDataCard,
  DangerZoneCard,
} from "@/components/settings/settings-cards";

export default function SettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <AppShell onAddTransaction={() => setDialogOpen(true)}>
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Settings
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
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
          <CurrencySelector />
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
