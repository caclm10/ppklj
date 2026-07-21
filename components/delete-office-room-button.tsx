"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteOfficeRoom } from "@/actions/office-room";
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

interface DeleteOfficeRoomButtonProps {
    roomId: string;
    officeId: string;
    name: string;
}

export function DeleteOfficeRoomButton({
    roomId,
    officeId,
    name,
}: DeleteOfficeRoomButtonProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteOfficeRoom(roomId);
            if (result.success) {
                toast.success("Ruangan berhasil dihapus");
                router.push(`/kantor/${officeId}/rooms`);
                router.refresh();
            } else {
                toast.error(result.message || "Gagal menghapus ruangan");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button variant="destructive" disabled={pending} />}
            >
                <Trash2Icon data-icon="inline-start" />
                Hapus Ruangan
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus ruangan{" "}
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
