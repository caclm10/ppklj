import { notFound } from "next/navigation";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeviceCategoryEditForm } from "@/components/device-category-edit-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function DeviceCategoryEditPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let category;
    try {
        category = await pb.collection("device_categories").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const initialData = {
        name: category.name,
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Edit Kategori Perangkat"
                backTo={`/devices/categories/${id}`}
            />

            <DeviceCategoryEditForm id={id} initialData={initialData} />
        </div>
    );
}

export default DeviceCategoryEditPage;
