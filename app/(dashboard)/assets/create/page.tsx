import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { AssetCreateForm } from "@/components/asset-create-form";
import { requireAuth } from "@/lib/server/pocketbase";

async function AssetCreatePage() {
    const pb = await requireAuth();

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

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader title="Tambah Aset" backTo="/assets" />

            <AssetCreateForm
                models={models}
                offices={offices}
                rooms={rooms}
            />
        </div>
    );
}

export default AssetCreatePage;
