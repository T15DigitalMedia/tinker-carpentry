import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100, "Name is too long"),
  email: z.email("Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(10, "Message needs at least 10 characters")
    .max(2000, "Message can't be longer than 2000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
