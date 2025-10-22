import { z } from "zod";

export const adviserSchema = z.object({
  experienceYears: z
    .string()
    .regex(/^\d+$/, "Experience must be a valid number")
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)), // Transform to number
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional(),
  office: z.string().optional(),
  socialLinks: z.string().url("Invalid social link format").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type Adviser = {
  experienceYears: number; // The number of years of experience
  linkedinUrl?: string; // Make linkedinUrl optional
  office?: string; // Office location
  socialLinks?: string; // Social media links (e.g., Twitter)
  status?: "ACTIVE" | "INACTIVE" | null; // Status can be either "ACTIVE", "INACTIVE", or null (nullable)
};
