"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteAsset } from "@/actions/asset";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface DeleteAssetButtonProps {
    id: string;
    hostname: string;
}

export function DeleteAssetButton({ id, hostname }: DeleteAssetButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [documentReference, setDocumentReference] = useState("");
    const [pending, startTransition] = useTransition();

    function handleDelete(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            const result = await deleteAsset(id, documentReference);
            if (result.success) {
                toast.success("Aset berhasil dihapus");
                setOpen(false);
                router.push("/assets");
            } else {
                toast.error(result.message || "Gagal menghapus aset");
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="destructive" disabled={pending} />
                }
            >
                <Trash2Icon data-icon="inline-start" />
                Hapus Aset
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleDelete}>
                    <DialogHeader>
                        <DialogTitle>Hapus Aset?</DialogTitle>
                        <DialogDescription>
                            Aset <strong>{hostname}</strong> akan dihapus secara
                            lunak. Masukkan referensi dokumen penghapusan jika ada.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Field>
                            <FieldLabel htmlFor="document-reference">
                                Referensi Dokumen (opsional)
                            </FieldLabel>
                            <Input
                                id="document-reference"
                                value={documentReference}
                                onChange={(e) =>
                                    setDocumentReference(e.target.value)
                                }
                                placeholder="Contoh: Surat Penghapusan Aset No. 123"
                                disabled={pending}
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={pending}
                                />
                            }
                        >
                            Batal
                        </DialogClose>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={pending}
                        >
                            {pending ? "Menghapus..." : "Hapus Aset"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
