"use server";

import * as z from "zod";
import { ClientResponseError } from "pocketbase";

import { requireAuth } from "@/lib/server/pocketbase";
import { getString, type ParsedRecord } from "@/lib/import";
import type { ImportResult } from "@/components/import-dialog";
import {
    createAssetSchema,
    updateAssetSchema,
    type CreateAssetInput,
    type CreateAssetResponse,
    type UpdateAssetInput,
    type UpdateAssetResponse,
} from "@/schemas/asset";

function relationValue(id: string | undefined | null) {
    return id ? [id] : [];
}

function optionalDate(value: string | undefined) {
    return value || undefined;
}

function optionalNumber(value: string | undefined): number | undefined {
    if (!value || value.trim() === "") return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
}

const ASSET_FIELDS = [
    "device_model_id",
    "serial_number",
    "hostname",
    "ip_address",
    "mac_address",
    "status",
    "firmware",
    "tahun_pembelian",
    "support_until",
    "warranty_until",
    "notes",
    "harga",
    "office_id",
    "room_id",
];

function firstExpanded(
    record: Record<string, unknown>,
    relationField: string
): Record<string, unknown> | undefined {
    const expanded = (record.expand as Record<string, unknown> | undefined)?.[
        relationField
    ];
    if (Array.isArray(expanded)) return expanded[0] as Record<string, unknown>;
    return expanded as Record<string, unknown> | undefined;
}

function officeName(record: Record<string, unknown>) {
    return (firstExpanded(record, "office_id")?.nama as string) || "";
}

function roomName(record: Record<string, unknown>) {
    const room = firstExpanded(record, "room_id");
    if (!room) return "";
    const name = (room.name as string) || "";
    const floor = room.floor !== undefined ? String(room.floor) : "";
    if (!name) return "";
    if (!floor) return name;
    return `${name} (Lantai ${floor})`;
}

function modelName(record: Record<string, unknown>) {
    const model = firstExpanded(record, "device_model_id");
    if (!model) return "";
    const vendor = (model.vendor as string) || "";
    const modelValue = (model.model as string) || "";
    return `${vendor} ${modelValue}`.trim();
}

function formatSnapshotValue(value: unknown) {
    if (value === undefined || value === null) return "";
    if (Array.isArray(value)) return value;
    return value;
}

function snapshotFromRecord(record: Record<string, unknown>) {
    const snapshot: Record<string, unknown> = {};
    for (const field of ASSET_FIELDS) {
        snapshot[field] = formatSnapshotValue(record[field]);
    }
    snapshot["device_model_name"] = modelName(record);
    snapshot["office_name"] = officeName(record);
    snapshot["room_name"] = roomName(record);
    return snapshot;
}

async function createAsset(
    payload: CreateAssetInput
): Promise<CreateAssetResponse> {
    try {
        const validation = createAssetSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        const record = await pb.collection("assets").create({
            device_model_id: relationValue(validation.data.deviceModelId),
            serial_number: validation.data.serialNumber,
            hostname: validation.data.hostname,
            ip_address: validation.data.ipAddress || undefined,
            mac_address: validation.data.macAddress || undefined,
            status: validation.data.status,
            firmware: validation.data.firmware || undefined,
            tahun_pembelian: validation.data.tahunPembelian || undefined,
            support_until: optionalDate(validation.data.supportUntil),
            warranty_until: optionalDate(validation.data.warrantyUntil),
            notes: validation.data.notes || undefined,
            harga: optionalNumber(validation.data.harga),
            office_id: relationValue(validation.data.officeId),
            room_id: relationValue(validation.data.roomId),
        });

        return {
            success: true,
            data: {
                id: record.id,
            },
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            console.log("ClientResponseError:", error.data)
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in createAsset:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat membuat aset.",
        };
    }
}

async function updateAsset(
    id: string,
    payload: UpdateAssetInput
): Promise<UpdateAssetResponse> {
    try {
        const validation = updateAssetSchema.safeParse(payload);

        if (!validation.success) {
            return {
                success: false,
                errors: z.flattenError(validation.error).fieldErrors,
            };
        }

        const pb = await requireAuth();

        await pb.collection("assets").update(id, {
            device_model_id: relationValue(validation.data.deviceModelId),
            serial_number: validation.data.serialNumber,
            hostname: validation.data.hostname,
            ip_address: validation.data.ipAddress || undefined,
            mac_address: validation.data.macAddress || undefined,
            status: validation.data.status,
            firmware: validation.data.firmware || undefined,
            tahun_pembelian: validation.data.tahunPembelian || undefined,
            support_until: optionalDate(validation.data.supportUntil),
            warranty_until: optionalDate(validation.data.warrantyUntil),
            notes: validation.data.notes || undefined,
            harga: optionalNumber(validation.data.harga),
            office_id: relationValue(validation.data.officeId),
            room_id: relationValue(validation.data.roomId),
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

        console.error("Error in updateAsset:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat memperbarui aset.",
        };
    }
}

async function deleteAsset(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const pb = await requireAuth();
        const user = pb.authStore.record;
        const record = await pb.collection("assets").getOne(id, {
            expand: "device_model_id,office_id,room_id",
        });

        await pb.collection("asset_activities").create({
            asset_id: id,
            asset_snapshot: snapshotFromRecord(record),
            asset_updates: {},
            date: new Date().toISOString().slice(0, 10),
            type: "hapus",
            notes: "Aset dihapus dari sistem.",
            performed_by: user?.name || user?.email || undefined,
        });

        await pb.collection("assets").delete(id);

        return { success: true };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Error in deleteAsset:", error);

        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus aset.",
        };
    }
}

function parseDeviceModel(value: string): { vendor: string; model: string } {
    const parts = value.split(/\s+/);
    const vendor = parts[0] || value;
    const model = parts.slice(1).join(" ") || value;
    return { vendor, model };
}

function normalizeDate(value: string): string | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return value;
}

function normalizeNumber(value: string): number | undefined {
    if (!value) return undefined;
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
}

async function importAssets(records: ParsedRecord[]): Promise<ImportResult> {
    const pb = await requireAuth();
    let success = 0;
    let skipped = 0;
    const errors: string[] = [];

    const [models, categories, offices, rooms, existingAssets] =
        await Promise.all([
            pb
                .collection("device_models")
                .getFullList({ expand: "device_category_id" }),
            pb.collection("device_categories").getFullList(),
            pb.collection("offices").getFullList(),
            pb.collection("office_rooms").getFullList(),
            pb.collection("assets").getFullList({ fields: "id,serial_number,hostname" }),
        ]);

    const existingSerials = new Set(
        existingAssets.map((a) => String(a.serial_number).toLowerCase().trim())
    );
    const existingHostnames = new Set(
        existingAssets.map((a) => String(a.hostname).toLowerCase().trim())
    );

    const modelKey = (vendor: string, model: string) =>
        `${vendor.toLowerCase()}|${model.toLowerCase()}`;
    const modelByKey = new Map(
        models.map((m) => [
            modelKey(String(m.vendor), String(m.model)),
            m.id,
        ])
    );
    const categoryByName = new Map(
        categories.map((c) => [String(c.name).toLowerCase().trim(), c.id])
    );
    const officeByName = new Map(
        offices.map((o) => [String(o.nama).toLowerCase().trim(), o.id])
    );
    const roomByKey = new Map(
        rooms.map((r) => [
            `${String(r.name).toLowerCase().trim()}|${String(r.office_id).toLowerCase().trim()}`,
            r.id,
        ])
    );

    for (const record of records) {
        const deviceModelValue = getString(record.data, "device model");
        const serialNumber = getString(record.data, "serial number");
        const hostname = getString(record.data, "hostname");

        if (!deviceModelValue || !serialNumber || !hostname) {
            skipped++;
            continue;
        }

        const normalizedSerial = serialNumber.toLowerCase();
        const normalizedHostname = hostname.toLowerCase();
        if (existingSerials.has(normalizedSerial) || existingHostnames.has(normalizedHostname)) {
            skipped++;
            continue;
        }

        const { vendor, model } = parseDeviceModel(deviceModelValue);
        let deviceModelId = modelByKey.get(modelKey(vendor, model));

        if (!deviceModelId) {
            const categoryName = getString(record.data, "device category");
            const categoryId = categoryByName.get(categoryName.toLowerCase());
            if (!categoryId) {
                errors.push(
                    `Baris ${record.row}: device model "${deviceModelValue}" belum terdaftar dan tidak ada kategori yang cocok.`
                );
                skipped++;
                continue;
            }

            try {
                const created = await pb.collection("device_models").create({
                    device_category_id: categoryId,
                    vendor,
                    model,
                });
                deviceModelId = created.id;
                modelByKey.set(modelKey(vendor, model), created.id);
            } catch (error) {
                if (error instanceof ClientResponseError) {
                    errors.push(`Baris ${record.row}: ${error.message}`);
                } else {
                    errors.push(
                        `Baris ${record.row}: gagal membuat device model.`
                    );
                }
                skipped++;
                continue;
            }
        }

        const officeName = getString(record.data, "nama kantor");
        const officeId = officeByName.get(officeName.toLowerCase());

        let roomId: string | undefined;
        const roomName = getString(record.data, "nama ruangan");
        if (roomName && officeId) {
            roomId = roomByKey.get(
                `${roomName.toLowerCase()}|${officeId.toLowerCase()}`
            );
        }

        const status = getString(record.data, "status") || "baik";
        const validStatuses = ["baik", "rusak", "rusak berat"];
        const finalStatus = validStatuses.includes(status.toLowerCase())
            ? status.toLowerCase()
            : "baik";

        const payload = {
            device_model_id: deviceModelId,
            serial_number: serialNumber,
            hostname,
            ip_address: getString(record.data, "ip address") || undefined,
            mac_address: getString(record.data, "mac address") || undefined,
            status: finalStatus,
            firmware: getString(record.data, "firmware") || undefined,
            tahun_pembelian:
                getString(record.data, "tahun pembelian") || undefined,
            support_until: normalizeDate(getString(record.data, "support until")),
            warranty_until: normalizeDate(
                getString(record.data, "warranty until")
            ),
            notes: getString(record.data, "notes") || undefined,
            harga: normalizeNumber(getString(record.data, "harga")),
            office_id: officeId,
            room_id: roomId,
        };

        try {
            await pb.collection("assets").create(payload);
            existingSerials.add(normalizedSerial);
            existingHostnames.add(normalizedHostname);
            success++;
        } catch (error) {
            if (error instanceof ClientResponseError) {
                errors.push(`Baris ${record.row}: ${error.message}`);
            } else {
                errors.push(`Baris ${record.row}: gagal menyimpan aset.`);
            }
        }
    }

    return { success, skipped, errors };
}

export { createAsset, updateAsset, deleteAsset, importAssets };
