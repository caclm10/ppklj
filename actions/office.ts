"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import { getString, type ParsedRecord } from "@/lib/import";
import type { ImportResult } from "@/components/import-dialog";
import {
    createOfficeSchema,
    updateOfficeSchema,
    type CreateOfficeInput,
    type CreateOfficeResponse,
    type UpdateOfficeInput,
    type UpdateOfficeResponse,
} from "@/schemas/office";

async function createOffice(
    payload: CreateOfficeInput
): Promise<CreateOfficeResponse> {
    try {
        const validation = createOfficeSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const _payload = {
            nama: validation.data.nama,
            kode: validation.data.kode,
            pic: validation.data.pic,
        };

        const record = await pb.collection("offices").create(_payload);

        return {
            success: true,
            data: {
                id: record.id,
            },
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in createOffice:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat membuat kantor.",
        };
    }
}

async function updateOffice(
    id: string,
    payload: UpdateOfficeInput
): Promise<UpdateOfficeResponse> {
    try {
        const validation = updateOfficeSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const _payload = {
            nama: validation.data.nama,
            kode: validation.data.kode,
            pic: validation.data.pic,
        };

        await pb.collection("offices").update(id, _payload);

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

        console.error("Error in updateOffice:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat memperbarui kantor.",
        };
    }
}

async function deleteOffice(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const pb = await requireAuth();
        await pb.collection("offices").delete(id);
        return { success: true };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in deleteOffice:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus kantor.",
        };
    }
}

async function importOffices(records: ParsedRecord[]): Promise<ImportResult> {
    const pb = await requireAuth();
    let success = 0;
    let skipped = 0;
    const errors: string[] = [];

    const [existingOffices, pics] = await Promise.all([
        pb.collection("offices").getFullList({ fields: "id,nama" }),
        pb.collection("pic").getFullList({ fields: "id,name" }),
    ]);
    const existingNames = new Set(
        existingOffices.map((o) => String(o.nama).toLowerCase().trim())
    );
    const picByName = new Map(
        pics.map((p) => [String(p.name).toLowerCase().trim(), p.id])
    );

    for (const record of records) {
        const nama = getString(record.data, "nama kantor");
        if (!nama) {
            skipped++;
            continue;
        }

        const normalizedName = nama.toLowerCase();
        if (existingNames.has(normalizedName)) {
            skipped++;
            continue;
        }

        const picNames = getString(record.data, "nama pic")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        const picIds = picNames
            .map((name) => picByName.get(name))
            .filter((id): id is string => Boolean(id));

        const payload = {
            nama,
            kode: getString(record.data, "kode") || undefined,
            pic: picIds,
        };

        try {
            await pb.collection("offices").create(payload);
            existingNames.add(normalizedName);
            success++;
        } catch (error) {
            if (error instanceof ClientResponseError) {
                errors.push(`Baris ${record.row}: ${error.message}`);
            } else {
                errors.push(`Baris ${record.row}: gagal menyimpan kantor.`);
            }
        }
    }

    return { success, skipped, errors };
}

export { createOffice, updateOffice, deleteOffice, importOffices };
