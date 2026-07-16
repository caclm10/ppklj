"use server";

import * as z from "zod";

import { requireAuth } from "@/lib/server/pocketbase";
import {
    createPicSchema,
    updatePicSchema,
    type CreatePicInput,
    type CreatePicResponse,
    type UpdatePicInput,
    type UpdatePicResponse,
} from "@/schemas/pic";
import { ClientResponseError } from "pocketbase";

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

export { createPic, updatePic };
