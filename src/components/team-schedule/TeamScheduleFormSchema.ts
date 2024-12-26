import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  timeIn: z.string(),
  timeOut: z.string(),
  workdays: z.string(),
  restDays: z.string(),
  monthlyRate: z.number().min(0),
  hourlyRate: z.number().min(0),
  position: z.string().optional(),
});

export type FormSchema = z.infer<typeof formSchema>;