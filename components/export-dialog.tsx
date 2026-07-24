"use client";

import { useMemo, useState, useTransition } from "react";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";

export interface ExportColumn {
    key: string;
    label: string;
}

export interface ExportResult {
    base64: string;
    filename: string;
}

interface ExportDialogProps {
    title: string;
    description: string;
    columns: ExportColumn[];
    onExport: (selectedKeys: string[]) => Promise<ExportResult>;
}

function downloadBase64(base64: string, filename: string) {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function ExportDialog({
    title,
    description,
    columns,
    onExport,
}: ExportDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
        columns.map((c) => c.key)
    );
    const [isPending, startTransition] = useTransition();

    const allSelected = useMemo(
        () => selectedKeys.length === columns.length,
        [selectedKeys, columns]
    );

    function toggleKey(key: string, checked: boolean) {
        setSelectedKeys((prev) =>
            checked ? [...prev, key] : prev.filter((k) => k !== key)
        );
    }

    function toggleAll(checked: boolean) {
        setSelectedKeys(checked ? columns.map((c) => c.key) : []);
    }

    function handleExport() {
        startTransition(async () => {
            const result = await onExport(selectedKeys);
            downloadBase64(result.base64, result.filename);
            setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
            >
                <DownloadIcon data-icon="inline-start" />
                Ekspor
            </Button>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            Pilih kolom yang akan diekspor
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAll(!allSelected)}
                        >
                            {allSelected ? "Hapus Semua" : "Pilih Semua"}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {columns.map((column) => {
                            const id = `export-col-${column.key}`;
                            const checked = selectedKeys.includes(column.key);
                            return (
                                <div
                                    key={column.key}
                                    className="flex items-start gap-2"
                                >
                                    <Checkbox
                                        id={id}
                                        checked={checked}
                                        onCheckedChange={(nextChecked) =>
                                            toggleKey(
                                                column.key,
                                                Boolean(nextChecked)
                                            )
                                        }
                                    />
                                    <FieldLabel
                                        htmlFor={id}
                                        className="cursor-pointer font-normal"
                                    >
                                        {column.label}
                                    </FieldLabel>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleExport}
                        disabled={selectedKeys.length === 0 || isPending}
                    >
                        {isPending ? "Mengekspor..." : "Ekspor XLSX"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { ExportDialog };
