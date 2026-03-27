import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Please enter a valid email address").max(255),
  company: z.string().max(200, "Company name is too long").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message is too long"),
});

export const intakeSchema = z.object({
  message: z.string().min(10, "Please describe your request in at least 10 characters").max(10000, "Request is too long"),
  category: z.string().optional().or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type IntakeFormData = z.infer<typeof intakeSchema>;
