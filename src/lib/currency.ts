export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
};

const DEFAULT_CURRENCY: CurrencyCode = "INR";

/**
 * Get the user's selected currency from localStorage or default
 */
export function getSelectedCurrency(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const stored = localStorage.getItem("smart-ledger-currency");
  if (stored && stored in CURRENCIES) return stored as CurrencyCode;
  return DEFAULT_CURRENCY;
}

/**
 * Save the selected currency to localStorage
 */
export function setSelectedCurrency(code: CurrencyCode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("smart-ledger-currency", code);
  }
}

/**
 * Format a number as currency using the user's selected currency
 * - Compact: ₹1.2K for large values
 * - Full: ₹1,234.56 for normal values
 */
export function formatCurrency(
  amount: number,
  options?: {
    currency?: CurrencyCode;
    compact?: boolean;
    showSign?: boolean;
  }
): string {
  const code = options?.currency ?? getSelectedCurrency();
  const config = CURRENCIES[code];

  const formatter = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: options?.compact ? "compact" : "standard",
  });

  const formatted = formatter.format(Math.abs(amount));

  if (options?.showSign && amount > 0) {
    return `+${formatted}`;
  }
  if (amount < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

/**
 * Get just the currency symbol
 */
export function getCurrencySymbol(code?: CurrencyCode): string {
  const c = code ?? getSelectedCurrency();
  return CURRENCIES[c].symbol;
}
