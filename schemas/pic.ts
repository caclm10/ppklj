import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const createPicSchema = z.object({
    name: z
        .string({ error: "Nama tidak valid." })
        .min(1, { error: "Nama harus diisi." }),
    whatsappNumber: z
        .string({ error: "Nomor whatsapp tidak valid." })

        .trim()
        .regex(
            /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/,
            "Nomor whatsapp tidak valid."
        ),
    nip: z
        .string({ error: "NIP tidak valid." })
        .trim()
        .regex(/^\d{18}$/, "NIP harus terdiri dari 18 digit angka.")
        .optional()
        .or(z.literal("")),
    email: z
        .email({ error: "Email tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    suratKeputusan: z
        .string({ error: "Surat keputusan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
});

type CreatePicInput = z.infer<typeof createPicSchema>;
type CreatePicResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreatePicInput>;
};

const updatePicSchema = createPicSchema;
type UpdatePicInput = CreatePicInput;
type UpdatePicResponse = CreatePicResponse;

export type {
    CreatePicInput,
    CreatePicResponse,
    UpdatePicInput,
    UpdatePicResponse,
};

export { createPicSchema, updatePicSchema };
