import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const createDeviceCategorySchema = z.object({
    name: z
        .string({ error: "Nama kategori tidak valid." })
        .min(1, { error: "Nama kategori harus diisi." }),
});

type CreateDeviceCategoryInput = z.infer<typeof createDeviceCategorySchema>;
type CreateDeviceCategoryResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateDeviceCategoryInput>;
};

const updateDeviceCategorySchema = createDeviceCategorySchema;
type UpdateDeviceCategoryInput = CreateDeviceCategoryInput;
type UpdateDeviceCategoryResponse = CreateDeviceCategoryResponse;

export type {
    CreateDeviceCategoryInput,
    CreateDeviceCategoryResponse,
    UpdateDeviceCategoryInput,
    UpdateDeviceCategoryResponse,
};

export { createDeviceCategorySchema, updateDeviceCategorySchema };
