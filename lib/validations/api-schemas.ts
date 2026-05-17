import { z } from "zod";

export const CreateOrderSchema = z.object({
  amount: z.number().min(100).max(100000), // Min 1 INR
  currency: z.literal("INR"),
  receipt: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  photos: z.array(z.string().url()).max(6, "You can upload a maximum of 6 pictures."),
  // Add other profile fields as needed here
});

export const BlockUserSchema = z.object({
  blockedId: z.string().min(1),
  action: z.enum(["block", "unblock"]).optional().default("block"),
});

export const ReportUserSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.string().min(10).max(500),
});
