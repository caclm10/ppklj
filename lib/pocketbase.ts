import PocketBase from "pocketbase";

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
if (!pbUrl) throw new Error("PocketBase URL environment variable is missing.");

// This single global instance is safe and ideal for client-side usage
const pb = new PocketBase(pbUrl);

export { pb };
