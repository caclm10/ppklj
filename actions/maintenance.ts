"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import {
    maintenanceSchema,
    type CreateMaintenanceInput,
    type CreateMaintenanceResponse,
} from "@/schemas/maintenance";

function firstId(value: unknown) {
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === "string" && value) return value;
    return "";
}

function officeName(record: Record<string, unknown>) {
    const expanded = (record.expand as Record<string, unknown> | undefined)?.[
        "office_id"
    ];
    const first = Array.isArray(expanded)
        ? (expanded[0] as Record<string, unknown>)
        : (expanded as Record<string, unknown> | undefined);
    return (first?.nama as string) || "";
}

function roomName(record: Record<string, unknown>) {
    const expanded = (record.expand as Record<string, unknown> | undefined)?.[
        "room_id"
    ];
    const first = Array.isArray(expanded)
        ? (expanded[0] as Record<string, unknown>)
        : (expanded as Record<string, unknown> | undefined);
    if (!first) return "";
    const name = (first.name as string) || "";
    const floor = first.floor !== undefined ? String(first.floor) : "";
    if (!name) return "";
    if (!floor) return name;
    return `${name} (Lantai ${floor})`;
}

function modelName(record: Record<string, unknown>) {
    const expanded = (record.expand as Record<string, unknown> | undefined)?.[
        "device_model_id"
    ];
    const first = Array.isArray(expanded)
        ? (expanded[0] as Record<string, unknown>)
        : (expanded as Record<string, unknown> | undefined);
    if (!first) return "";
    const vendor = (first.vendor as string) || "";
    const model = (first.model as string) || "";
    return `${vendor} ${model}`.trim();
}

function buildSnapshot(record: Record<string, unknown>) {
    return {
        device_model_id: firstId(record.device_model_id),
        device_model_name: modelName(record),
        serial_number: record.serial_number || "",
        hostname: record.hostname || "",
        ip_address: record.ip_address || "",
        mac_address: record.mac_address || "",
        status: record.status || "",
        firmware: record.firmware || "",
        tahun_pembelian: record.tahun_pembelian || "",
        support_until: record.support_until || "",
        warranty_until: record.warranty_until || "",
        notes: record.notes || "",
        office_id: firstId(record.office_id),
        office_name: officeName(record),
        room_id: firstId(record.room_id),
        room_name: roomName(record),
    };
}

async function createMaintenance(
    payload: CreateMaintenanceInput
): Promise<CreateMaintenanceResponse> {
    try {
        const validation = maintenanceSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();
        const data = validation.data;
        const user = pb.authStore.record;

        const asset = await pb
            .collection("assets")
            .getFirstListItem(
                pb.filter("id = {:id} && deleted = null", {
                    id: data.assetId,
                }),
                { expand: "device_model_id,office_id,room_id" }
            );

        const assetUpdates: Record<string, unknown> = {};
        const assetUpdatePayload: Record<string, unknown> = {};

        if (data.updateStatus && data.newStatus) {
            assetUpdates.status = data.newStatus;
            assetUpdatePayload.status = data.newStatus;
        }

        if (data.updateFirmware && data.newFirmware) {
            assetUpdates.firmware = data.newFirmware;
            assetUpdatePayload.firmware = data.newFirmware;
        }

        if (Object.keys(assetUpdatePayload).length > 0) {
            await pb.collection("assets").update(data.assetId, assetUpdatePayload);
        }

        await pb.collection("asset_activities").create({
            asset_id: data.assetId,
            asset_snapshot: buildSnapshot(asset),
            asset_updates: assetUpdates,
            date: data.date,
            type: "maintenance",
            notes: data.description || undefined,
            performed_by: data.performedBy || user?.name || user?.email || undefined,
        });

        return {
            success: true,
            data: {
                id: data.assetId,
            },
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in createMaintenance:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat mencatat maintenance.",
        };
    }
}

export { createMaintenance };
