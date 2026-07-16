import { cache } from "react";

import { createServerPB } from "@/lib/server/pocketbase";

const getCurrentUser = cache(async () => {
    const pb = await createServerPB();

    return pb.authStore.record || null;
});

export { getCurrentUser };
