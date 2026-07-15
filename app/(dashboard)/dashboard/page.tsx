import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { createServerPB } from "@/lib/server/pocketbase";

async function DashboardPage() {
    const pb = await createServerPB();

    console.log("Is Valid?", pb.authStore.isValid);
    console.log(pb.authStore.record);

    return (
        <>
            Name: {pb.authStore.record?.name}
            {/*  */}
            <form action={logout}>
                <Button type="submit">Log out</Button>
            </form>
        </>
    );
}

export default DashboardPage;
