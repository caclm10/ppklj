import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const maintenanceSchema = z.object({
    assetId: z.string({ error: "Aset tidak valid." }),
    date: z
        .string({ error: "Tanggal tidak valid." })
        .min(1, { error: "Tanggal harus diisi." }),
    description: z
        .string({ error: "Deskripsi tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    performedBy: z
        .string({ error: "Pelaksana tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    updateStatus: z.boolean().optional(),
    newStatus: z
        .enum(["baik", "rusak", "rusak berat"])
        .optional()
        .or(z.literal("")),
    updateFirmware: z.boolean().optional(),
    newFirmware: z
        .string({ error: "Firmware tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
});

type CreateMaintenanceInput = z.infer<typeof maintenanceSchema>;
type CreateMaintenanceResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateMaintenanceInput>;
};

export type {
    CreateMaintenanceInput,
    CreateMaintenanceResponse,
};

export { maintenanceSchema };
