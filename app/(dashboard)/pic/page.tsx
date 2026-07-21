import Link from "next/link";
import { PlusIcon, UserIcon, ArrowRightIcon, UploadIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { TableControl } from "@/components/table-control";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ImportDialog, ImportDialogTrigger } from "@/components/import-dialog";
import { importPics } from "@/actions/pic";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        page?: string;
    }>;
}

async function PICPage({ searchParams }: PageProps) {
    const pb = await requireAuth();
    const params = await searchParams;

    const searchQuery = params.search || "";
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));
    const itemsPerPage = 10;

    let pics: RecordModel[] = [];
    let totalItems = 0;
    let totalPages = 0;

    try {
        const filterParts = [];
        if (searchQuery) {
            filterParts.push(
                `(name ~ "${searchQuery}" || nip ~ "${searchQuery}" || whatsapp_number ~ "${searchQuery}" || email ~ "${searchQuery}")`
            );
        }

        const resultList = await pb
            .collection("pic")
            .getList(currentPage, itemsPerPage, {
                sort: "-created",
                filter: filterParts.length > 0 ? filterParts.join(" && ") : "",
            });

        pics = resultList.items;
        totalItems = resultList.totalItems;
        totalPages = resultList.totalPages;
    } catch (error) {
        console.error("Failed to fetch PIC list:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Daftar PIC"
                action={
                    <div className="flex items-center gap-2">
                        <ImportDialog
                            title="Impor PIC"
                            description="Unggah file Excel atau CSV dengan kolom wajib 'Nama PIC'. Kolom lain yang didukung: Nomor WhatsApp, NIP, Email, Surat Keputusan."
                            requiredColumns={["nama pic"]}
                            columnLabels={{
                                "nama pic": "Nama PIC",
                            }}
                            onImport={importPics}
                            trigger={<ImportDialogTrigger />}
                        />
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/pic/create" />}
                        >
                            <PlusIcon />
                            Tambah PIC
                        </Button>
                    </div>
                }
            />

            {pics.length === 0 && !searchQuery ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <UserIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada PIC</EmptyTitle>
                        <EmptyDescription>
                            Silakan tambahkan PIC baru untuk mulai mengelola
                            Person In Charge di sistem ini.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/pic/create" />}
                        >
                            <PlusIcon />
                            Tambah PIC
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="flex flex-col gap-4">
                    <TableControl
                        searchPlaceholder="Cari nama, NIP, nomor WA, atau email..."
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                    />

                    {pics.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center text-card-foreground">
                            <span className="text-sm font-medium text-muted-foreground">
                                Tidak ditemukan PIC yang cocok dengan pencarian
                                Anda.
                            </span>
                        </div>
                    ) : (
                        <Card className="overflow-hidden py-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Nama PIC
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            NIP
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            WhatsApp
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Email
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Surat Keputusan
                                        </TableHead>
                                        <TableHead className="w-[100px] text-right font-semibold"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pics.map((pic) => (
                                        <TableRow key={pic.id}>
                                            <TableCell className="font-medium">
                                                {pic.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {pic.nip || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {pic.whatsapp_number}
                                            </TableCell>
                                            <TableCell>
                                                {pic.email || "-"}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {pic.surat_keputusan || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    nativeButton={false}
                                                    render={
                                                        <Link
                                                            href={`/pic/${pic.id}`}
                                                        />
                                                    }
                                                >
                                                    <span>Detail</span>
                                                    <ArrowRightIcon className="size-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

export default PICPage;
