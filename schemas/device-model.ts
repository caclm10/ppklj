import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const createDeviceModelSchema = z.object({
    deviceCategoryId: z
        .string({ error: "Kategori tidak valid." })
        .min(1, { error: "Kategori harus dipilih." }),
    vendor: z
        .string({ error: "Vendor tidak valid." })
        .min(1, { error: "Vendor harus diisi." }),
    model: z
        .string({ error: "Model tidak valid." })
        .min(1, { error: "Model harus diisi." }),
});

type CreateDeviceModelInput = z.infer<typeof createDeviceModelSchema>;
type CreateDeviceModelResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateDeviceModelInput>;
};

const updateDeviceModelSchema = createDeviceModelSchema;
type UpdateDeviceModelInput = CreateDeviceModelInput;
type UpdateDeviceModelResponse = CreateDeviceModelResponse;

export type {
    CreateDeviceModelInput,
    CreateDeviceModelResponse,
    UpdateDeviceModelInput,
    UpdateDeviceModelResponse,
};

export { createDeviceModelSchema, updateDeviceModelSchema };
