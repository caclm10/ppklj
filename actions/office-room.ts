"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import {
    createOfficeRoomSchema,
    updateOfficeRoomSchema,
    type CreateOfficeRoomInput,
    type CreateOfficeRoomResponse,
    type UpdateOfficeRoomInput,
    type UpdateOfficeRoomResponse,
} from "@/schemas/office-room";

async function createOfficeRoom(
    officeId: string,
    payload: CreateOfficeRoomInput
): Promise<CreateOfficeRoomResponse> {
    try {
        const validation = createOfficeRoomSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const record = await pb.collection("office_rooms").create({
            name: validation.data.name,
            floor: validation.data.floor,
            code: validation.data.code,
            office_id: [officeId],
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

        console.error("Error in createOfficeRoom:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat membuat ruangan.",
        };
    }
}

async function updateOfficeRoom(
    roomId: string,
    payload: UpdateOfficeRoomInput
): Promise<UpdateOfficeRoomResponse> {
    try {
        const validation = updateOfficeRoomSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        await pb.collection("office_rooms").update(roomId, {
            name: validation.data.name,
            floor: validation.data.floor,
            code: validation.data.code,
        });

        return {
            success: true,
            data: {
                id: roomId,
            },
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in updateOfficeRoom:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat memperbarui ruangan.",
        };
    }
}

async function deleteOfficeRoom(
    roomId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const pb = await requireAuth();
        await pb.collection("office_rooms").delete(roomId);
        return { success: true };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in deleteOfficeRoom:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus ruangan.",
        };
    }
}

export { createOfficeRoom, updateOfficeRoom, deleteOfficeRoom };
