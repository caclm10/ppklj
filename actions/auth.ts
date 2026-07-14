"use server";

import { redirect } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import * as z from "zod";

import type { ActionResponse, FormErrors } from "@/schemas/action";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { createActionPB } from "@/lib/server/pocketbase";

async function login(
    payload: LoginFormData
): Promise<ActionResponse<FormErrors<LoginFormData>>> {
    const validation = loginSchema.safeParse(payload);

    if (!validation.success) {
        return {
            success: false,
            errors: z.flattenError(validation.error).fieldErrors,
        };
    }

    const { pb, commit } = await createActionPB();

    try {
        await pb
            .collection("users")
            .authWithPassword(payload.email, payload.password);

        await commit();
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        return {
            success: false,
            message: "Terjadi kesalahan di internal server.",
        };
    }

    redirect("/dashboard");
}

export { login };
