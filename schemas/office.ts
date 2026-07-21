import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const createOfficeSchema = z.object({
    nama: z
        .string({ error: "Nama kantor tidak valid." })
        .min(1, { error: "Nama kantor harus diisi." }),
    kode: z
        .string({ error: "Kode kantor tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    pic: z
        .array(z.string())
        .max(10, { error: "Maksimal 10 PIC per kantor." })
        .optional()
        .default([]),
});

type CreateOfficeInput = z.infer<typeof createOfficeSchema>;
type CreateOfficeResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateOfficeInput>;
};

const updateOfficeSchema = createOfficeSchema;
type UpdateOfficeInput = CreateOfficeInput;
type UpdateOfficeResponse = CreateOfficeResponse;

export type {
    CreateOfficeInput,
    CreateOfficeResponse,
    UpdateOfficeInput,
    UpdateOfficeResponse,
};

export { createOfficeSchema, updateOfficeSchema };
