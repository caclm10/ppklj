import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const maintenanceTypeValues = ["update", "perbaikan", "lainnya"] as const;

const assetUpdateValues = ["status", "firmware", "notes"] as const;

const createMaintenanceSchema = z.object({
    assetId: z.string({ error: "Aset tidak valid." }),
    date: z
        .string({ error: "Tanggal tidak valid." })
        .min(1, { error: "Tanggal harus diisi." }),
    type: z.enum(maintenanceTypeValues, {
        error: "Tipe maintenance tidak valid.",
    }),
    typeOther: z
        .string({ error: "Tipe lainnya tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
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
    updateNotes: z.boolean().optional(),
    newNotes: z
        .string({ error: "Catatan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
});

const maintenanceSchemaWithConditional = createMaintenanceSchema.refine(
    (data) => {
        if (data.type !== "lainnya") return true;
        return Boolean(data.typeOther && data.typeOther.trim() !== "");
    },
    {
        message: "Tipe lainnya harus diisi.",
        path: ["typeOther"],
    }
);

type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
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

export {
    createMaintenanceSchema,
    maintenanceSchemaWithConditional,
    maintenanceTypeValues,
    assetUpdateValues,
};
