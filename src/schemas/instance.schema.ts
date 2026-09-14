import { z } from "zod";
import { LINE_STATUS, LINE_TYPE, SUBSTATION_TYPE } from "../types";
 
export const SubstationSchema = z.object({
  id: z.string(),
  type: z.enum([SUBSTATION_TYPE.PRIMARY, SUBSTATION_TYPE.SECONDARY]),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});
 
export const LineSchema = z.object({
  source: z.string(),
  target: z.string(),
  status: z.enum([LINE_STATUS.OPEN, LINE_STATUS.CLOSED]),
  type: z.enum(["", LINE_TYPE.BUILDABLE, LINE_TYPE.REMOVABLE]),
  length: z.number(),
  path: z.array(z.tuple([z.number(), z.number()])).optional(),
});
 
export const InstanceSchema = z.object({
  substations: z.array(SubstationSchema),
  start_lines: z.array(LineSchema),
  target_lines: z.array(LineSchema),
});
 
export type Substation = z.infer<typeof SubstationSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Instance = z.infer<typeof InstanceSchema>;