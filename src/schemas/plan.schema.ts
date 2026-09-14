import { z } from "zod";
 
export const ActionItemSchema = z.object({
  action: z.enum(["add", "remove", "switch"]),
  params: z.array(z.string()),
});
 
export const PlanSchema = z.record(
  z.string().regex(/^\d+$/, "Key must be a numeric string"),
  z.array(ActionItemSchema)
);
 
export type ActionItem = z.infer<typeof ActionItemSchema>;
export type Plan = z.infer<typeof PlanSchema>;