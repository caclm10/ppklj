"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import { getString, type ParsedRecord } from "@/lib/import";
import type { ImportResult } from "@/components/import-dialog";
import {
    createPicSchema,
    updatePicSchema,
    type CreatePicInput,
    type CreatePicResponse,
    type UpdatePicInput,
    type UpdatePicResponse,
} from "@/schemas/pic";

async function createPic(payload: CreatePicInput): Promise<CreatePicResponse> {
    try {
        const validation = createPicSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const _payload = {
            name: validation.data.name,
            whatsapp_number: validation.data.whatsappNumber,
            nip: validation.data.nip,
            email: validation.data.email,
            surat_keputusan: validation.data.suratKeputusan,
        };

        console.log("Creating PIC with payload:", _payload);

        const record = await pb.collection("pic").create(_payload);

        return {
            success: true,
            data: {
                id: record.id,
            },
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            console.log("ClientResponseError in createPic:", error.data.data);
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in createPic:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat membuat PIC.",
        };
    }
}

async function updatePic(
    id: string,
    payload: UpdatePicInput
): Promise<UpdatePicResponse> {
    try {
        const validation = updatePicSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const _payload = {
            name: validation.data.name,
            whatsapp_number: validation.data.whatsappNumber,
            nip: validation.data.nip,
            email: validation.data.email,
            surat_keputusan: validation.data.suratKeputusan,
        };

        await pb.collection("pic").update(id, _payload);

        return {
            success: true,
            data: {
                id,
            },
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in updatePic:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat memperbarui PIC.",
        };
    }
}

async function deletePic(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const pb = await requireAuth();
        await pb.collection("pic").delete(id);
        return { success: true };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in deletePic:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus PIC.",
        };
    }
}

async function importPics(records: ParsedRecord[]): Promise<ImportResult> {
    const pb = await requireAuth();
    let success = 0;
    let skipped = 0;
    const errors: string[] = [];

    const existing = await pb
        .collection("pic")
        .getFullList({ fields: "id,name" });
    const existingNames = new Set(
        existing.map((p) => String(p.name).toLowerCase().trim())
    );

    for (const record of records) {
        const name = getString(record.data, "nama pic");
        if (!name) {
            skipped++;
            continue;
        }

        const normalizedName = name.toLowerCase();
        if (existingNames.has(normalizedName)) {
            skipped++;
            continue;
        }

        const whatsapp = getString(record.data, "nomor whatsapp");
        const payload = {
            name,
            whatsapp_number: whatsapp || "-",
            nip: getString(record.data, "nip") || undefined,
            email: getString(record.data, "email") || undefined,
            surat_keputusan:
                getString(record.data, "surat keputusan") || undefined,
        };

        try {
            await pb.collection("pic").create(payload);
            existingNames.add(normalizedName);
            success++;
        } catch (error) {
            if (error instanceof ClientResponseError) {
                errors.push(`Baris ${record.row}: ${error.message}`);
            } else {
                errors.push(`Baris ${record.row}: gagal menyimpan PIC.`);
            }
        }
    }

    return { success, skipped, errors };
}

export { createPic, updatePic, deletePic, importPics };
