"use client";

import { useMemo, useState } from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SearchIcon,
    TrashIcon,
    UserIcon,
} from "lucide-react";
import type { RecordModel } from "pocketbase";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PicPickerDialogProps {
    pics: RecordModel[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

function PicPickerDialog({
    pics,
    selectedIds,
    onChange,
}: PicPickerDialogProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredPics = useMemo(() => {
        const query = search.trim().toLowerCase();
        const base = query
            ? pics.filter(
                  (pic) =>
                      String(pic.name || "").toLowerCase().includes(query) ||
                      String(pic.whatsapp_number || "")
                          .toLowerCase()
                          .includes(query)
              )
            : [...pics];
        return base.sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""))
        );
    }, [pics, search]);

    const selectedPics = useMemo(() => {
        return pics.filter((pic) => selectedIds.includes(pic.id));
    }, [pics, selectedIds]);

    const pageSize = 5;
    const totalPages = Math.max(
        1,
        Math.ceil(filteredPics.length / pageSize)
    );
    const paginatedPics = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPics.slice(start, start + pageSize);
    }, [filteredPics, currentPage]);

    function togglePic(id: string) {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    }

    function removePic(id: string) {
        onChange(selectedIds.filter((selectedId) => selectedId !== id));
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {selectedPics.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        Belum ada PIC dipilih.
                    </p>
                ) : (
                    selectedPics.map((pic) => (
                        <div
                            key={pic.id}
                            className="flex items-center gap-2 rounded-md border bg-muted px-2 py-1 text-sm"
                        >
                            <UserIcon className="size-3.5 text-muted-foreground" />
                            <span>{pic.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {pic.whatsapp_number}
                            </span>
                            <button
                                type="button"
                                onClick={() => removePic(pic.id)}
                                className="ml-1 rounded p-0.5 hover:bg-muted-foreground/20"
                                aria-label={`Hapus ${pic.name}`}
                            >
                                <TrashIcon className="size-3.5 text-muted-foreground" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                    render={
                        <Button
                            type="button"
                            variant="outline"
                            className="w-fit"
                        >
                            <UserIcon data-icon="inline-start" />
                            Pilih PIC
                        </Button>
                    }
                />
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Pilih PIC</DialogTitle>
                        <DialogDescription>
                            Cari dan pilih PIC terkait kantor ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau nomor WhatsApp..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9"
                            />
                        </div>

                        <div className="max-h-[320px] overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Nomor WhatsApp</TableHead>
                                        <TableHead className="w-[100px] text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPics.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center text-muted-foreground"
                                            >
                                                Tidak menemukan PIC.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedPics.map((pic) => {
                                            const isSelected =
                                                selectedIds.includes(pic.id);
                                            return (
                                                <TableRow key={pic.id}>
                                                    <TableCell>
                                                        {pic.name || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {pic.whatsapp_number || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant={
                                                                isSelected
                                                                    ? "secondary"
                                                                    : "outline"
                                                            }
                                                            size="sm"
                                                            onClick={() =>
                                                                togglePic(pic.id)
                                                            }
                                                        >
                                                            {isSelected
                                                                ? "Dipilih"
                                                                : "Pilih"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman {currentPage} dari {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.max(1, page - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeftIcon className="size-4" />
                                    Sebelumnya
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(totalPages, page + 1)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Berikutnya
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Selesai
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export { PicPickerDialog };
