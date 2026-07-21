import { notFound } from "next/navigation";
import { ClientResponseError, type RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeviceModelEditForm } from "@/components/device-model-edit-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function DeviceModelEditPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let model;
    try {
        model = await pb.collection("device_models").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    let categories: RecordModel[] = [];
    try {
        categories = await pb.collection("device_categories").getFullList({
            sort: "name",
        });
    } catch (error) {
        console.error("Failed to fetch device categories:", error);
    }

    const initialData = {
        deviceCategoryId: model.device_category_id,
        vendor: model.vendor,
        model: model.model,
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Edit Model Perangkat"
                backTo={`/devices/${id}`}
            />

            <DeviceModelEditForm
                id={id}
                initialData={initialData}
                categories={categories}
            />
        </div>
    );
}

export default DeviceModelEditPage;
