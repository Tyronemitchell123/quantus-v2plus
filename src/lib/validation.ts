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

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
  referralCode: z.string().max(20).optional().or(z.literal("")),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
});

export const enterpriseDemoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().trim().email("Please enter a valid work email").max(255),
  company: z.string().trim().min(1, "Company is required").max(200, "Company name is too long"),
  phone: z.string().max(30, "Phone number is too long").optional().or(z.literal("")),
  teamSize: z.string().max(50).optional().or(z.literal("")),
  message: z.string().max(5000, "Message is too long").optional().or(z.literal("")),
});

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  company: z.string().trim().min(1, "Company is required").max(200, "Company name is too long"),
  category: z.string().min(1, "Please select a category"),
  region: z.string().max(100, "Region is too long").optional().or(z.literal("")),
});

export const quantumJobSchema = z.object({
  circuit: z.string().trim().min(1, "Circuit code is required").max(50000, "Circuit is too large"),
  shots: z.number().int().min(1, "At least 1 shot required").max(10000, "Maximum 10,000 shots"),
  deviceArn: z.string().min(1, "Please select a device"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type IntakeFormData = z.infer<typeof intakeSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type EnterpriseDemoFormData = z.infer<typeof enterpriseDemoSchema>;
export type PartnerFormData = z.infer<typeof partnerSchema>;
export type QuantumJobFormData = z.infer<typeof quantumJobSchema>;
