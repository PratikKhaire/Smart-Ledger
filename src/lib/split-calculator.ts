/**
 * Pure split calculation utilities
 * Handles deterministic rounding and remainder distribution
 */

/**
 * Calculate equal split amounts for a given total and participant count.
 * Uses deterministic rounding: all participants get the floor amount,
 * and the first participant absorbs the remainder (max 1 cent difference).
 */
export function calculateEqualSplit(
  totalAmount: number,
  participantCount: number
): number[] {
  if (participantCount <= 0) return [];
  if (participantCount === 1) return [roundToTwo(totalAmount)];

  const baseAmount = Math.floor((totalAmount / participantCount) * 100) / 100;
  const remainder = roundToTwo(totalAmount - baseAmount * participantCount);

  const amounts: number[] = [];
  for (let i = 0; i < participantCount; i++) {
    if (i === 0) {
      amounts.push(roundToTwo(baseAmount + remainder));
    } else {
      amounts.push(baseAmount);
    }
  }

  return amounts;
}

/**
 * Validate that exact split amounts sum to the total.
 * Allows ±0.01 tolerance for floating-point rounding.
 */
export function validateExactSplit(
  totalAmount: number,
  participantAmounts: number[]
): { valid: boolean; difference: number } {
  const sum = participantAmounts.reduce((acc, val) => acc + val, 0);
  const difference = roundToTwo(Math.abs(totalAmount - sum));
  return {
    valid: difference <= 0.01,
    difference,
  };
}

/**
 * Preview split calculation for display
 */
export function previewSplit(
  totalAmount: number,
  method: "EQUAL" | "EXACT",
  participantNames: string[],
  exactAmounts?: number[]
): { name: string; owedAmount: number }[] {
  if (method === "EQUAL") {
    const amounts = calculateEqualSplit(totalAmount, participantNames.length);
    return participantNames.map((name, i) => ({
      name,
      owedAmount: amounts[i] ?? 0,
    }));
  }

  // EXACT mode: use provided amounts
  if (!exactAmounts || exactAmounts.length !== participantNames.length) {
    return participantNames.map((name) => ({ name, owedAmount: 0 }));
  }

  return participantNames.map((name, i) => ({
    name,
    owedAmount: roundToTwo(exactAmounts[i]),
  }));
}

/**
 * Round a number to exactly two decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
