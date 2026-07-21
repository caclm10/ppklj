"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deletePic } from "@/actions/pic";
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

interface DeletePicButtonProps {
    id: string;
    name: string;
}

export function DeletePicButton({ id, name }: DeletePicButtonProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deletePic(id);
            if (result.success) {
                toast.success("PIC berhasil dihapus");
                router.push("/pic");
                router.refresh();
            } else {
                toast.error(result.message || "Gagal menghapus PIC");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button variant="destructive" disabled={pending} />}
            >
                <Trash2Icon className="size-4" />
                Hapus PIC
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus PIC?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus PIC{" "}
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
