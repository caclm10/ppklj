import { requireAuth } from "@/lib/server/pocketbase";

async function DashboardPage() {
    const pb = await requireAuth();

    return (
        <>
            Name: {pb.authStore.record?.name}
            {/*  */}
        </>
    );
}

export default DashboardPage;
