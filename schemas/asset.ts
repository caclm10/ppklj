import type { FormErrors } from "@/schemas/action";
import * as z from "zod";

const assetStatusValues = ["baik", "rusak", "rusak berat"] as const;

const createAssetSchema = z.object({
    deviceModelId: z
        .string({ error: "Model perangkat tidak valid." })
        .min(1, { error: "Model perangkat harus dipilih." }),
    serialNumber: z
        .string({ error: "Serial number tidak valid." })
        .min(1, { error: "Serial number harus diisi." }),
    hostname: z
        .string({ error: "Hostname tidak valid." })
        .min(1, { error: "Hostname harus diisi." }),
    ipAddress: z
        .string({ error: "IP address tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    macAddress: z
        .string({ error: "MAC address tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    status: z.enum(assetStatusValues, {
        error: "Status tidak valid.",
    }),
    firmware: z
        .string({ error: "Firmware tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    tahunPembelian: z
        .string({ error: "Tahun pembelian tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    supportUntil: z
        .string({ error: "Tanggal support tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    warrantyUntil: z
        .string({ error: "Tanggal garansi tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    notes: z
        .string({ error: "Catatan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    harga: z
        .string({ error: "Harga tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    officeId: z
        .string({ error: "Kantor tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
    roomId: z
        .string({ error: "Ruangan tidak valid." })
        .trim()
        .optional()
        .or(z.literal("")),
});

type CreateAssetInput = z.infer<typeof createAssetSchema>;
type CreateAssetResponse = {
    success: boolean;
    message?: string;
    data?: {
        id: string;
    };
    errors?: FormErrors<CreateAssetInput>;
};

const updateAssetSchema = createAssetSchema;
type UpdateAssetInput = CreateAssetInput;
type UpdateAssetResponse = CreateAssetResponse;

export type {
    CreateAssetInput,
    CreateAssetResponse,
    UpdateAssetInput,
    UpdateAssetResponse,
};

export { createAssetSchema, updateAssetSchema, assetStatusValues };
