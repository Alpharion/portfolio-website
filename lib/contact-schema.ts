import { z } from "zod";

/** Shared by the ContactForm (client) and /api/contact (server). FROZEN after scaffold. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
