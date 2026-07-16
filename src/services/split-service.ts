import {
  calculateEqualSplit,
  validateExactSplit,
  previewSplit,
  roundToTwo,
} from "@/lib/split-calculator";
import type { SplitPreviewInput } from "@/schemas/shared-expense";

/**
 * Split service — orchestrates split preview and validation
 */

export interface SplitPreviewResult {
  participants: { name: string; owedAmount: number }[];
  totalAmount: number;
  splitMethod: string;
  isValid: boolean;
  difference?: number;
}

export function getPreview(input: SplitPreviewInput): SplitPreviewResult {
  const { totalAmount, splitMethod, participants } = input;

  if (splitMethod === "EQUAL") {
    const amounts = calculateEqualSplit(totalAmount, participants.length);
    return {
      participants: participants.map((p, i) => ({
        name: p.name,
        owedAmount: amounts[i],
      })),
      totalAmount: roundToTwo(totalAmount),
      splitMethod,
      isValid: true,
    };
  }

  // EXACT mode
  const exactAmounts = participants.map((p) => p.owedAmount || 0);
  const validation = validateExactSplit(totalAmount, exactAmounts);
  const preview = previewSplit(
    totalAmount,
    "EXACT",
    participants.map((p) => p.name),
    exactAmounts
  );

  return {
    participants: preview,
    totalAmount: roundToTwo(totalAmount),
    splitMethod,
    isValid: validation.valid,
    difference: validation.difference,
  };
}
