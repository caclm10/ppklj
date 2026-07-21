"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import {
    createDeviceModelSchema,
    updateDeviceModelSchema,
    type CreateDeviceModelInput,
    type CreateDeviceModelResponse,
    type UpdateDeviceModelInput,
    type UpdateDeviceModelResponse,
} from "@/schemas/device-model";

async function createDeviceModel(
    payload: CreateDeviceModelInput
): Promise<CreateDeviceModelResponse> {
    try {
        const validation = createDeviceModelSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const record = await pb.collection("device_models").create({
            device_category_id: validation.data.deviceCategoryId,
            vendor: validation.data.vendor,
            model: validation.data.model,
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

        console.error("Error in createDeviceModel:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat membuat model perangkat.",
        };
    }
}

async function updateDeviceModel(
    id: string,
    payload: UpdateDeviceModelInput
): Promise<UpdateDeviceModelResponse> {
    try {
        const validation = updateDeviceModelSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        await pb.collection("device_models").update(id, {
            device_category_id: validation.data.deviceCategoryId,
            vendor: validation.data.vendor,
            model: validation.data.model,
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

        console.error("Error in updateDeviceModel:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat memperbarui model perangkat.",
        };
    }
}

async function deleteDeviceModel(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const pb = await requireAuth();
        await pb.collection("device_models").delete(id);
        return { success: true };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in deleteDeviceModel:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus model perangkat.",
        };
    }
}

export { createDeviceModel, updateDeviceModel, deleteDeviceModel };
