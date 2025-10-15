import { z } from "zod";

export const addUserSchema = z
  .object({
    firstname: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(30, "First name too long")
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Only letters allowed"),
    lastname: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(30, "Last name too long")
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Only letters allowed"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username too long")
      .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, ._- only"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Must contain a letter and a number"),
    confirmedPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Passwords do not match",
    path: ["confirmedPassword"],
  });

export type AddUserFormData = z.infer<typeof addUserSchema>;

//Edite User
export const editUserSchema = z.object({
  userName: z.string().min(1, "Username is required"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required" }),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Full name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  isActive: z.boolean(),
  bio: z.string().optional(),
  address: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^\+855\d{8,9}$/, "Invalid Cambodian phone number format (+855...)")
    .optional(),
  telegramId: z
    .string()
    .regex(/^@/, "Telegram ID must start with '@'")
    .optional(),
});

export type EditUserSchema = z.infer<typeof editUserSchema>;




