import { notFound } from "next/navigation";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { OfficeRoomEditForm } from "@/components/office-room-edit-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string; roomId: string }>;
}

async function OfficeRoomEditPage({ params }: PageProps) {
    const { id, roomId } = await params;
    const pb = await requireAuth();

    let room;
    try {
        room = await pb.collection("office_rooms").getOne(roomId);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const officeIds: string[] = room.office_id || [];
    if (!officeIds.includes(id)) {
        notFound();
    }

    const initialData = {
        name: room.name,
        floor: room.floor,
        code: room.code || "",
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Edit Ruangan"
                backTo={`/kantor/${id}/rooms/${roomId}`}
            />

            <OfficeRoomEditForm
                roomId={roomId}
                officeId={id}
                initialData={initialData}
            />
        </div>
    );
}

export default OfficeRoomEditPage;
