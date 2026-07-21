"use client";

import { useMemo, useState } from "react";
import {
    ArrowLeftIcon,
    Building2Icon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DoorOpenIcon,
    MapPinIcon,
    SearchIcon,
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

interface OfficeRoomPickerDialogProps {
    offices: RecordModel[];
    rooms: RecordModel[];
    officeId: string | undefined;
    roomId: string | undefined;
    onChange: (values: { officeId: string; roomId: string }) => void;
}

const PAGE_SIZE = 5;

function usePagedList(items: RecordModel[], searchFields: string[]) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        const base = query
            ? items.filter((item) =>
                  searchFields.some((field) =>
                      String(item[field] || "")
                          .toLowerCase()
                          .includes(query)
                  )
              )
            : [...items];
        return base.sort((a, b) =>
            String(a.name || a.nama || "")
                .localeCompare(String(b.name || b.nama || ""))
        );
    }, [items, searchFields, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    function updateSearch(value: string) {
        setSearch(value);
        setPage(1);
    }

    return {
        search,
        updateSearch,
        page,
        setPage,
        totalPages,
        paginated,
    };
}

function OfficeRoomPickerDialog({
    offices,
    rooms,
    officeId,
    roomId,
    onChange,
}: OfficeRoomPickerDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"office" | "room">("office");
    const [selectedOfficeId, setSelectedOfficeId] = useState(officeId);

    const officeList = usePagedList(offices, ["nama"]);
    const availableRooms = useMemo(() => {
        if (!selectedOfficeId) return [];
        return rooms
            .filter((room) => room.office_id?.includes(selectedOfficeId))
            .sort((a, b) =>
                String(a.name || "").localeCompare(String(b.name || ""))
            );
    }, [rooms, selectedOfficeId]);
    const roomList = usePagedList(availableRooms, ["name", "floor", "code"]);

    const currentList = step === "office" ? officeList : roomList;

    const selectedOffice = useMemo(() => {
        return offices.find((o) => o.id === officeId);
    }, [offices, officeId]);

    const selectedRoom = useMemo(() => {
        return rooms.find((r) => r.id === roomId);
    }, [rooms, roomId]);

    function selectOffice(id: string) {
        setSelectedOfficeId(id);
        setStep("room");
    }

    function selectRoom(id: string) {
        onChange({ officeId: selectedOfficeId || "", roomId: id });
        setOpen(false);
        setStep("office");
    }

    function selectWithoutRoom() {
        onChange({ officeId: selectedOfficeId || "", roomId: "" });
        setOpen(false);
        setStep("office");
    }

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (nextOpen) {
            setSelectedOfficeId(officeId || "");
            setStep("office");
            officeList.updateSearch("");
            roomList.updateSearch("");
        }
    }

    const displayLabel = useMemo(() => {
        if (!selectedOffice) return "Pilih kantor dan ruangan";
        if (!selectedRoom) return `${selectedOffice.nama} - Tanpa ruangan`;
        return `${selectedOffice.nama} - ${selectedRoom.name} (lantai ${selectedRoom.floor})`;
    }, [selectedOffice, selectedRoom]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Building2Icon className="size-4 text-muted-foreground" />
                <span className={selectedOffice ? "" : "text-muted-foreground"}>
                    {displayLabel}
                </span>
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger
                    render={
                        <Button
                            type="button"
                            variant="outline"
                            className="w-fit"
                        >
                            <MapPinIcon data-icon="inline-start" />
                            Pilih Kantor & Ruangan
                        </Button>
                    }
                />
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Pilih Kantor & Ruangan</DialogTitle>
                        <DialogDescription>
                            {step === "office"
                                ? "Pilih kantor tempat aset berada."
                                : "Pilih ruangan di kantor tersebut, atau pilih tanpa ruangan."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {step === "room" && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-fit"
                                onClick={() => setStep("office")}
                            >
                                <ArrowLeftIcon data-icon="inline-start" />
                                Kembali ke daftar kantor
                            </Button>
                        )}

                        <div className="relative">
                            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={
                                    step === "office"
                                        ? "Cari nama kantor..."
                                        : "Cari nama, lantai, atau kode ruangan..."
                                }
                                value={currentList.search}
                                onChange={(e) =>
                                    currentList.updateSearch(e.target.value)
                                }
                                className="pl-9"
                            />
                        </div>

                        <div className="max-h-[320px] overflow-x-auto overflow-y-auto rounded-md border">
                            <Table className="min-w-full table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60%]">
                                            {step === "office"
                                                ? "Nama Kantor"
                                                : "Nama Ruangan"}
                                        </TableHead>
                                        {step !== "office" && (
                                            <>
                                                <TableHead className="w-[80px]">
                                                    Lantai
                                                </TableHead>
                                                <TableHead className="hidden w-[80px] sm:table-cell">
                                                    Kode
                                                </TableHead>
                                            </>
                                        )}
                                        <TableHead className="w-[100px] text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {step === "office" ? (
                                        officeList.paginated.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    Tidak ada kantor.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            officeList.paginated.map((office) => (
                                                <TableRow key={office.id}>
                                                    <TableCell className="max-w-0 truncate font-medium">
                                                        {office.nama || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                selectOffice(
                                                                    office.id
                                                                )
                                                            }
                                                        >
                                                            Pilih
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )
                                    ) : (
                                        <>
                                            <TableRow className="bg-muted/30">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <DoorOpenIcon className="size-4 text-muted-foreground" />
                                                        Tanpa Ruangan
                                                    </div>
                                                </TableCell>
                                                <TableCell>-</TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    -
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={
                                                            selectWithoutRoom
                                                        }
                                                    >
                                                        <CheckIcon data-icon="inline-start" />
                                                        Pilih
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            {roomList.paginated.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="text-center text-muted-foreground"
                                                    >
                                                        Tidak ada ruangan di
                                                        kantor ini.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                roomList.paginated.map((room) => (
                                                    <TableRow key={room.id}>
                                                        <TableCell className="max-w-0 truncate font-medium">
                                                            {room.name || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {room.floor || "-"}
                                                        </TableCell>
                                                        <TableCell className="hidden max-w-0 truncate sm:table-cell">
                                                            {room.code || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    selectRoom(
                                                                        room.id
                                                                    )
                                                                }
                                                            >
                                                                Pilih
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman {currentList.page} dari{" "}
                                {currentList.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        currentList.setPage((page) =>
                                            Math.max(1, page - 1)
                                        )
                                    }
                                    disabled={currentList.page === 1}
                                >
                                    <ChevronLeftIcon className="size-4" />
                                    Sebelumnya
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        currentList.setPage((page) =>
                                            Math.min(
                                                currentList.totalPages,
                                                page + 1
                                            )
                                        )
                                    }
                                    disabled={
                                        currentList.page ===
                                        currentList.totalPages
                                    }
                                >
                                    Berikutnya
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export { OfficeRoomPickerDialog };
