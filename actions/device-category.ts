"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import {
    createDeviceCategorySchema,
    updateDeviceCategorySchema,
    type CreateDeviceCategoryInput,
    type CreateDeviceCategoryResponse,
    type UpdateDeviceCategoryInput,
    type UpdateDeviceCategoryResponse,
} from "@/schemas/device-category";

async function createDeviceCategory(
    payload: CreateDeviceCategoryInput
): Promise<CreateDeviceCategoryResponse> {
    try {
        const validation = createDeviceCategorySchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const record = await pb.collection("device_categories").create({
            name: validation.data.name,
        });

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

        console.error("Error in createDeviceCategory:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat membuat kategori.",
        };
    }
}

async function updateDeviceCategory(
    id: string,
    payload: UpdateDeviceCategoryInput
): Promise<UpdateDeviceCategoryResponse> {
    try {
        const validation = updateDeviceCategorySchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        await pb.collection("device_categories").update(id, {
            name: validation.data.name,
        });

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

        console.error("Error in updateDeviceCategory:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat memperbarui kategori.",
        };
    }
}

async function deleteDeviceCategory(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const pb = await requireAuth();
        await pb.collection("device_categories").delete(id);
        return { success: true };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in deleteDeviceCategory:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus kategori.",
        };
    }
}

export { createDeviceCategory, updateDeviceCategory, deleteDeviceCategory };
