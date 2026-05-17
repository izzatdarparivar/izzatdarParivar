import { z } from "zod";

export const CreateOrderSchema = z.object({
  amount: z.number().min(100).max(100000), // Min 1 INR
  currency: z.literal("INR"),
  receipt: z.string().optional(),
});
