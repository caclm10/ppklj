import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { KantorCreateForm } from "@/components/kantor-create-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {}

async function KantorCreatePage() {
    const pb = await requireAuth();

    let pics: RecordModel[] = [];
    try {
        pics = await pb.collection("pic").getFullList({
            sort: "-created",
        });
    } catch (error) {
        console.error("Failed to fetch PIC list for selection:", error);
    }

    return (
        <>
            <DashboardHeader title="Tambah Kantor Baru" backTo="/kantor" />

            <KantorCreateForm pics={pics} />
        </>
    );
}

export default KantorCreatePage;
