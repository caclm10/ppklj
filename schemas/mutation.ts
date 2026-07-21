import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const createMutationSchema = z.object({
    assetId: z.string({ error: "Aset tidak valid." }),
    date: z
        .string({ error: "Tanggal tidak valid." })
        .min(1, { error: "Tanggal harus diisi." }),
    toOfficeId: z
        .string({ error: "Kantor tujuan tidak valid." })
        .min(1, { error: "Kantor tujuan harus dipilih." }),
    toRoomId: z
        .string({ error: "Ruangan tujuan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    notes: z
        .string({ error: "Catatan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
});

type CreateMutationInput = z.infer<typeof createMutationSchema>;
type CreateMutationResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateMutationInput>;
};

export type {
    CreateMutationInput,
    CreateMutationResponse,
};

export { createMutationSchema };
