import { z } from "zod";

export const paperSchema = z.object({
  title: z.string().min(1, "Title is required"),
  abstractText: z.string().min(1, "Abstract is required"),
  file: z
    .instanceof(File, { message: "File is required" })
    .or(z.string().url("Invalid file URL")),
  thumbnail: z
    .instanceof(File, { message: "Thumbnail is required" })
    .or(z.string().url("Invalid thumbnail URL")),
  categoryUuid: z.string().min(1, "Please select a category"),
});

export type PaperFormData = z.infer<typeof paperSchema>;

export const editPaperSchema = z.object({
  title: z
    .string()
    .min(3, "Title is required and must be at least 3 characters."),
  abstractText: z.string().min(10, "Abstract must be at least 10 characters."),
  fileUrl: z
    .instanceof(File, { message: "File is required" })
    .or(z.string().url("Invalid file URL")), // Specific to PDF file URL
  thumbnailUrl: z
    .instanceof(File, { message: "Thumbnail is required" })
    .or(z.string().url("Invalid thumbnail URL")), // Optional thumbnail URL
  category: z.string().min(1, "At least one category is required."),
});

export type EditPaperFormData = z.infer<typeof editPaperSchema>;
