import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const createOfficeRoomSchema = z.object({
    name: z
        .string({ error: "Nama ruangan tidak valid." })
        .min(1, { error: "Nama ruangan harus diisi." }),
    floor: z
        .string({ error: "Lantai tidak valid." })
        .min(1, { error: "Lantai harus diisi." }),
    code: z
        .string({ error: "Kode ruangan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
});

type CreateOfficeRoomInput = z.infer<typeof createOfficeRoomSchema>;
type CreateOfficeRoomResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateOfficeRoomInput>;
};

const updateOfficeRoomSchema = createOfficeRoomSchema;
type UpdateOfficeRoomInput = CreateOfficeRoomInput;
type UpdateOfficeRoomResponse = CreateOfficeRoomResponse;

export type {
    CreateOfficeRoomInput,
    CreateOfficeRoomResponse,
    UpdateOfficeRoomInput,
    UpdateOfficeRoomResponse,
};

export { createOfficeRoomSchema, updateOfficeRoomSchema };
