"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteDeviceCategory } from "@/actions/device-category";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteDeviceCategoryButtonProps {
    id: string;
    name: string;
}

export function DeleteDeviceCategoryButton({
    id,
    name,
}: DeleteDeviceCategoryButtonProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteDeviceCategory(id);
            if (result.success) {
                toast.success("Kategori berhasil dihapus");
                router.push("/devices/categories");
                router.refresh();
            } else {
                toast.error(result.message || "Gagal menghapus kategori");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button variant="destructive" disabled={pending} />}
            >
                <Trash2Icon data-icon="inline-start" />
                Hapus Kategori
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus kategori{" "}
                        <strong>{name}</strong>? Tindakan ini tidak dapat
                        dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={pending}
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
