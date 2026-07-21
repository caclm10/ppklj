"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteAsset } from "@/actions/asset";
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

interface DeleteAssetButtonProps {
    id: string;
    hostname: string;
}

export function DeleteAssetButton({ id, hostname }: DeleteAssetButtonProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteAsset(id);
            if (result.success) {
                toast.success("Aset berhasil dihapus");
                router.push("/assets");
                router.refresh();
            } else {
                toast.error(result.message || "Gagal menghapus aset");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button variant="destructive" disabled={pending} />}
            >
                <Trash2Icon data-icon="inline-start" />
                Hapus Aset
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Aset?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus aset{" "}
                        <strong>{hostname}</strong>? Tindakan ini tidak dapat
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
