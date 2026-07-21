"use client";

import { useState, useTransition, cloneElement } from "react";
import { FileUpIcon, UploadIcon, XIcon } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { getString, parseImportFile, type ParsedRecord } from "@/lib/import";

export interface ImportPreview {
    row: number;
    valid: boolean;
    reason?: string;
    data: Record<string, unknown>;
}

export interface ImportResult {
    success: number;
    skipped: number;
    errors?: string[];
}

interface ImportDialogProps {
    title: string;
    description: string;
    requiredColumns: string[];
    columnLabels: Record<string, string>;
    validate?: (record: ParsedRecord) => { valid: boolean; reason?: string };
    onImport: (records: ParsedRecord[]) => Promise<ImportResult>;
    trigger?: React.ReactNode;
}

function normalizeKey(key: string) {
    return key.toLowerCase().trim();
}

function validateRequired(
    record: ParsedRecord,
    requiredColumns: string[]
): { valid: boolean; reason?: string } {
    for (const col of requiredColumns) {
        const value = getString(record.data, normalizeKey(col));
        if (!value) {
            return { valid: false, reason: `Kolom "${col}" wajib diisi.` };
        }
    }
    return { valid: true };
}

function ImportDialog({
    title,
    description,
    requiredColumns,
    columnLabels,
    validate,
    onImport,
    trigger,
}: ImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [previews, setPreviews] = useState<ImportPreview[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [isPending, startTransition] = useTransition();
    const itemsPerPage = 5;

    function reset() {
        setPreviews([]);
        setFileName("");
        setCurrentPage(1);
        setResult(null);
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        reset();
        setFileName(file.name);

        const buffer = await file.arrayBuffer();
        const records = parseImportFile(buffer);

        const mapped = records.map((record) => {
            const normalizedData: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(record.data)) {
                normalizedData[normalizeKey(key)] = value;
            }

            const requiredCheck = validateRequired(
                { ...record, data: normalizedData },
                requiredColumns
            );
            const customCheck = validate
                ? validate({ ...record, data: normalizedData })
                : { valid: true };

            return {
                row: record.row,
                valid: requiredCheck.valid && customCheck.valid,
                reason: requiredCheck.reason || customCheck.reason,
                data: normalizedData,
            };
        });

        setPreviews(mapped);
    }

    function handleImport() {
        const validRecords = previews
            .filter((p) => p.valid)
            .map((p) => ({ row: p.row, data: p.data }));

        startTransition(async () => {
            const res = await onImport(validRecords);
            setResult(res);
            if (res.errors?.length === 0 && res.success > 0) {
                // Biarkan user lihat hasil, tutup manual atau otomatis setelah delay
            }
        });
    }

    const validCount = previews.filter((p) => p.valid).length;
    const invalidCount = previews.filter((p) => !p.valid).length;
    const totalPages = Math.ceil(previews.length / itemsPerPage);
    const pagedPreviews = previews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger}
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {!result && (
                    <>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <label
                                    className={buttonVariants({
                                        variant: "outline",
                                    })}
                                >
                                    <UploadIcon />
                                    Pilih File
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        disabled={isPending}
                                    />
                                </label>
                                {fileName && (
                                    <span className="text-sm text-muted-foreground">
                                        {fileName}
                                    </span>
                                )}
                                {fileName && (
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={reset}
                                        disabled={isPending}
                                    >
                                        <XIcon />
                                    </Button>
                                )}
                            </div>

                            <Alert>
                                <FileUpIcon />
                                <AlertTitle>Kolom wajib</AlertTitle>
                                <AlertDescription>
                                    {requiredColumns.join(", ")}
                                </AlertDescription>
                            </Alert>

                            {previews.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="secondary">
                                        {validCount} valid
                                    </Badge>
                                    {invalidCount > 0 && (
                                        <Badge variant="destructive">
                                            {invalidCount} dilewati
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {previews.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">
                                                Baris
                                            </TableHead>
                                            {requiredColumns.map((col) => (
                                                <TableHead key={col}>
                                                    {columnLabels[col] || col}
                                                </TableHead>
                                            ))}
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pagedPreviews.map((preview) => (
                                            <TableRow key={preview.row}>
                                                <TableCell>
                                                    {preview.row}
                                                </TableCell>
                                                {requiredColumns.map((col) => (
                                                    <TableCell key={col}>
                                                        {getString(
                                                            preview.data,
                                                            normalizeKey(col)
                                                        ) || "-"}
                                                    </TableCell>
                                                ))}
                                                <TableCell>
                                                    {preview.valid ? (
                                                        <Badge variant="secondary">
                                                            Valid
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            {preview.reason}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {totalPages > 1 && (
                                <div className="flex justify-center">
                                    <Pagination className="mx-0 w-auto">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    text="Prev"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage((p) =>
                                                            Math.max(1, p - 1)
                                                        );
                                                    }}
                                                    className={
                                                        currentPage <= 1
                                                            ? "pointer-events-none opacity-50"
                                                            : ""
                                                    }
                                                />
                                            </PaginationItem>
                                            {Array.from({
                                                length: totalPages,
                                            }).map((_, i) => {
                                                const pageNum = i + 1;
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    Math.abs(
                                                        pageNum - currentPage
                                                    ) <= 1
                                                ) {
                                                    return (
                                                        <PaginationItem
                                                            key={pageNum}
                                                        >
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={
                                                                    pageNum ===
                                                                    currentPage
                                                                }
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    setCurrentPage(
                                                                        pageNum
                                                                    );
                                                                }}
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }
                                                if (
                                                    pageNum === 2 ||
                                                    pageNum === totalPages - 1
                                                ) {
                                                    return (
                                                        <PaginationItem
                                                            key={pageNum}
                                                        >
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    text="Next"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage((p) =>
                                                            Math.min(
                                                                totalPages,
                                                                p + 1
                                                            )
                                                        );
                                                    }}
                                                    className={
                                                        currentPage >=
                                                        totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : ""
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validCount === 0 || isPending}
                            >
                                <UploadIcon />
                                {isPending
                                    ? "Mengimpor..."
                                    : `Impor ${validCount} Data`}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {result && (
                    <div className="flex flex-col gap-4">
                        <Alert
                            variant={
                                result.errors && result.errors.length > 0
                                    ? "destructive"
                                    : "default"
                            }
                        >
                            <AlertTitle>Hasil Impor</AlertTitle>
                            <AlertDescription>
                                Berhasil mengimpor {result.success} data.{" "}
                                {result.skipped > 0 &&
                                    `${result.skipped} data dilewati.`}
                            </AlertDescription>
                        </Alert>
                        {result.errors && result.errors.length > 0 && (
                            <div className="max-h-40 overflow-auto rounded-lg border p-3 text-sm text-destructive">
                                <ul className="list-disc space-y-1 pl-4">
                                    {result.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    setOpen(false);
                                    reset();
                                }}
                            >
                                Tutup
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ImportDialogTrigger() {
    return (
        <DialogTrigger render={<Button type="button" variant="outline" />}>
            <UploadIcon />
            Impor
        </DialogTrigger>
    );
}

export { ImportDialog, ImportDialogTrigger };
