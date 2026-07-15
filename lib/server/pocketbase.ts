import { cookies } from "next/headers";
import PocketBase from "pocketbase";

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
if (!pbUrl) throw new Error("PocketBase URL environment variable is missing.");

async function createServerPB() {
    const pb = new PocketBase(pbUrl);

    const cookieStore = await cookies();

    pb.authStore.loadFromCookie(cookieStore.toString());

    try {
        if (pb.authStore.isValid) {
            await pb.collection("users").authRefresh();
        }
    } catch {
        pb.authStore.clear();
    }

    return pb;
}

async function createActionPB() {
    const pb = new PocketBase(pbUrl);

    const cookieStore = await cookies();

    pb.authStore.loadFromCookie(cookieStore.toString());

    async function commit() {
        if (pb.authStore.isValid) {
            cookieStore.set(
                "pb_auth",
                JSON.stringify({
                    token: pb.authStore.token,
                    record: pb.authStore.record,
                }),
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                }
            );
        } else {
            cookieStore.delete("pb_auth");
        }
    }

    return {
        pb,
        commit,
    };
}

export { createServerPB, createActionPB };
