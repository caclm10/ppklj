import { notFound } from "next/navigation";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { OfficeRoomCreateForm } from "@/components/office-room-create-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function OfficeRoomCreatePage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    try {
        await pb.collection("offices").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Tambah Ruangan Baru"
                backTo={`/kantor/${id}/rooms`}
            />

            <OfficeRoomCreateForm officeId={id} />
        </div>
    );
}

export default OfficeRoomCreatePage;
