import { notFound } from "next/navigation";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { PicEditForm } from "@/components/pic-edit-form";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function PICEditPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let pic;
    try {
        pic = await pb.collection("pic").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const rawPhone = pic.whatsapp_number as string | undefined;
    const phoneValue =
        rawPhone && rawPhone !== "-"
            ? rawPhone.startsWith("+")
                ? rawPhone
                : `+${rawPhone}`
            : "";

    const initialData = {
        name: pic.name,
        whatsappNumber: phoneValue,
        nip: pic.nip || "",
        email: pic.email || "",
        suratKeputusan: pic.surat_keputusan || "",
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader title="Edit PIC" backTo={`/pic/${id}`} />

            <PicEditForm id={id} initialData={initialData} />
        </div>
    );
}

export default PICEditPage;
