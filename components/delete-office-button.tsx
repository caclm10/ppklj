"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteOffice } from "@/actions/office";
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

interface DeleteOfficeButtonProps {
    id: string;
    nama: string;
}

export function DeleteOfficeButton({ id, nama }: DeleteOfficeButtonProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteOffice(id);
            if (result.success) {
                toast.success("Kantor berhasil dihapus");
                router.push("/kantor");
                router.refresh();
            } else {
                toast.error(result.message || "Gagal menghapus kantor");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button variant="destructive" disabled={pending} />}
            >
                <Trash2Icon className="size-4" />
                Hapus Kantor
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Kantor?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus kantor{" "}
                        <strong>{nama}</strong>? Tindakan ini tidak dapat
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
