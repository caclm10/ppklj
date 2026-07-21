import { notFound } from "next/navigation";
import { ClientResponseError, type RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { KantorEditForm } from "@/components/kantor-edit-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function KantorEditPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let office;
    try {
        office = await pb.collection("offices").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    let pics: RecordModel[] = [];
    try {
        pics = await pb.collection("pic").getFullList({
            sort: "-created",
        });
    } catch (error) {
        console.error("Failed to fetch PIC list for edit selection:", error);
    }

    const initialData = {
        nama: office.nama,
        kode: office.kode || "",
        pic: office.pic || [],
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader title="Edit Kantor" backTo={`/kantor/${id}`} />

            <KantorEditForm id={id} initialData={initialData} pics={pics} />
        </div>
    );
}

export default KantorEditPage;
