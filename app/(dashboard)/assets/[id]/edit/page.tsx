import { notFound } from "next/navigation";
import { ClientResponseError, type RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { AssetEditForm } from "@/components/asset-edit-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

function firstId(value: unknown) {
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === "string" && value) return value;
    return "";
}

function dateInputValue(value: string | undefined | null) {
    if (!value) return "";
    return value.slice(0, 10);
}

async function AssetEditPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let asset;
    try {
        asset = await pb
            .collection("assets")
            .getFirstListItem(
                pb.filter("id = {:id} && deleted = null", { id })
            );
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    let models: RecordModel[] = [];
    let offices: RecordModel[] = [];
    let rooms: RecordModel[] = [];

    try {
        models = await pb.collection("device_models").getFullList({
            sort: "vendor,model",
        });
    } catch (error) {
        console.error("Failed to fetch device models:", error);
    }

    try {
        offices = await pb.collection("offices").getFullList({
            sort: "nama",
        });
    } catch (error) {
        console.error("Failed to fetch offices:", error);
    }

    try {
        rooms = await pb.collection("office_rooms").getFullList({
            sort: "name",
        });
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
    }

    const initialData = {
        deviceModelId: firstId(asset.device_model_id),
        serialNumber: asset.serial_number,
        hostname: asset.hostname,
        ipAddress: asset.ip_address || "",
        macAddress: asset.mac_address || "",
        status: asset.status,
        firmware: asset.firmware || "",
        tahunPembelian: asset.tahun_pembelian || "",
        supportUntil: dateInputValue(asset.support_until),
        warrantyUntil: dateInputValue(asset.warranty_until),
        harga: asset.harga != null ? String(asset.harga) : "",
        notes: asset.notes || "",
        officeId: firstId(asset.office_id),
        roomId: firstId(asset.room_id),
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader title="Edit Aset" backTo={`/assets/${id}`} />

            <AssetEditForm
                id={id}
                initialData={initialData}
                models={models}
                offices={offices}
                rooms={rooms}
            />
        </div>
    );
}

export default AssetEditPage;
