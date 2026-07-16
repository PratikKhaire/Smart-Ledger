import { z } from "zod";

/**
 * Split method enum
 */
export const SplitMethod = {
  EQUAL: "EQUAL",
  EXACT: "EXACT",
} as const;

/**
 * Split preview request schema (Zod 4 API)
 */
export const splitPreviewSchema = z.object({
  totalAmount: z
    .number()
    .positive("Total amount must be positive"),
  splitMethod: z.enum(["EQUAL", "EXACT"]),
  participants: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .transform((val) => val.trim()),
        owedAmount: z.number().min(0).optional(),
      })
    )
    .min(2, "At least two participants are required"),
});

export type SplitPreviewInput = z.infer<typeof splitPreviewSchema>;
