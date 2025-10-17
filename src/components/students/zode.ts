import z from "zod";

// Define Zod schema for validation

export const studentSchema = z
  .object({
    username: z.string().min(1, "username is required"),
    email: z.string().email("invalid email"),
    firstname: z.string().min(1, "first name is required"),
    lastname: z.string().min(1, "last name is required"),
    password: z
      .string()
      .min(8, "password must be at least 8 characters")
      .regex(/[A-Z]/, "password must contain an uppercase letter")
      .regex(/[a-z]/, "password must contain a lowercase letter")
      .regex(/\d/, "password must contain a number")
      .regex(/[^A-Za-z0-9]/, "password must contain a special character"),
    confirmedPassword: z.string().min(1, "please confirm password"),
  })
  .refine((vals) => vals.password === vals.confirmedPassword, {
    message: "Passwords do not match",
    path: ["confirmedPassword"],
  });

//edit

export const editStudentSchema = z.object({
  studentCardUrl: z
    .string()
    .min(1, "Student card image is required")
    .refine(
      (val) => {
        // Accept valid URLs or data URLs (base64 images)
        try {
          new URL(val);
          return true;
        } catch {
          // Check if it's a valid data URL
          return val.startsWith("data:image/");
        }
      },
      {
        message: "Invalid URL or image format for student card",
      }
    ),
  university: z.string().min(1, "University is required"),
  major: z.string().min(1, "Major is required"),
  yearsOfStudy: z
    .string()
    .regex(/^\d+$/, "Years of study should be a number")
    .min(1, "Years of study is required"),
});

// TypeScript type for the form data based on the schema
export type StudentFormData = z.infer<typeof studentSchema>;
export type EditStudentFormData = z.infer<typeof editStudentSchema>;
