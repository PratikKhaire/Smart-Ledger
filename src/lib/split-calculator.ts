/**
 * Split calculation utilities for equal and exact splits.
 */

/**
 * Divides an amount equally across N people.
 * Distributes any rounding remainder to the first recipients.
 * Returns an array of amounts that sum exactly to the total.
 */
export function calculateEqualSplit(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor((total * 100) / count) / 100;
  const remainder = Math.round((total - base * count) * 100);
  return Array.from({ length: count }, (_, i) =>
    i < remainder ? roundToTwo(base + 0.01) : base
  );
}

/**
 * Rounds a number to 2 decimal places (banker-safe).
 */
export function roundToTwo(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Validates that the exact split amounts sum correctly to the total.
 */
export function validateExactSplit(
  total: number,
  amounts: number[]
): { valid: boolean; difference: number } {
  const sum = roundToTwo(amounts.reduce((acc, a) => acc + a, 0));
  const difference = roundToTwo(Math.abs(sum - total));
  return { valid: difference < 0.01, difference };
}

/**
 * Generates a preview of a split for display.
 */
export function previewSplit(
  total: number,
  method: "EQUAL" | "EXACT",
  names: string[],
  exactAmounts?: number[]
): { name: string; owedAmount: number }[] {
  if (method === "EQUAL") {
    const amounts = calculateEqualSplit(total, names.length);
    return names.map((name, i) => ({ name, owedAmount: amounts[i] }));
  }
  return names.map((name, i) => ({
    name,
    owedAmount: roundToTwo(exactAmounts?.[i] ?? 0),
  }));
}
