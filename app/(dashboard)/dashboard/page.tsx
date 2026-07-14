import { createServerPB } from "@/lib/server/pocketbase";

async function DashboardPage() {
    const pb = await createServerPB();

    console.log("Is Valid?", pb.authStore.isValid);
    console.log(pb.authStore.record);

    return (
        <>
            Name: {pb.authStore.record?.name}
            {/*  */}
        </>
    );
}

export default DashboardPage;
