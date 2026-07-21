import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeviceModelCreateForm } from "@/components/device-model-create-form";
import { requireAuth } from "@/lib/server/pocketbase";

async function DeviceModelCreatePage() {
    const pb = await requireAuth();

    let categories: RecordModel[] = [];
    try {
        categories = await pb.collection("device_categories").getFullList({
            sort: "name",
        });
    } catch (error) {
        console.error("Failed to fetch device categories:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Tambah Model Perangkat"
                backTo="/devices"
            />

            <DeviceModelCreateForm categories={categories} />
        </div>
    );
}

export default DeviceModelCreatePage;
