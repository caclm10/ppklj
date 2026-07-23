import Link from "next/link";
import {
    PlusIcon,
    BuildingIcon,
    ArrowRightIcon,
} from "lucide-react";
import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { TableControl } from "@/components/table-control";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { ImportDialog } from "@/components/import-dialog";
import { importOffices } from "@/actions/office";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        page?: string;
    }>;
}

async function KantorPage({ searchParams }: PageProps) {
    const pb = await requireAuth();
    const params = await searchParams;

    const searchQuery = params.search || "";
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));
    const itemsPerPage = 10;

    let offices: RecordModel[] = [];
    let totalItems = 0;
    let totalPages = 0;

    try {
        const filterParts = [];
        if (searchQuery) {
            filterParts.push(
                `(nama ~ "${searchQuery}" || kode ~ "${searchQuery}")`
            );
        }

        const resultList = await pb
            .collection("offices")
            .getList(currentPage, itemsPerPage, {
                sort: "nama",
                expand: "pic",
                filter: filterParts.length > 0 ? filterParts.join(" && ") : "",
            });

        offices = resultList.items;
        totalItems = resultList.totalItems;
        totalPages = resultList.totalPages;
    } catch (error) {
        console.error("Failed to fetch offices list:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Daftar Kantor"
                action={
                    <div className="flex items-center gap-2">
                        <ImportDialog
                            title="Impor Kantor"
                            description="Unggah file Excel atau CSV dengan kolom wajib 'Nama Kantor'. Kolom lain yang didukung: Kode, Nama PIC (pisahkan dengan koma jika lebih dari satu)."
                            requiredColumns={["nama kantor"]}
                            columnLabels={{
                                "nama kantor": "Nama Kantor",
                            }}
                            onImport={importOffices}
                        />

                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/kantor/create" />}
                        >
                            <PlusIcon />
                            Tambah Kantor
                        </Button>
                    </div>
                }
            />

            {offices.length === 0 && !searchQuery ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BuildingIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada kantor</EmptyTitle>
                        <EmptyDescription>
                            Silakan tambahkan kantor baru untuk mulai mengelola
                            unit kantor di sistem ini.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/kantor/create" />}
                        >
                            <PlusIcon />
                            Tambah Kantor
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="flex flex-col gap-4">
                    <TableControl
                        searchPlaceholder="Cari nama kantor atau kode..."
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                    />

                    {offices.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center text-card-foreground">
                            <span className="text-sm font-medium text-muted-foreground">
                                Tidak ditemukan kantor yang cocok dengan
                                pencarian Anda.
                            </span>
                        </div>
                    ) : (
                        <Card className="overflow-hidden py-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Nama Kantor
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Kode
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Jumlah PIC
                                        </TableHead>
                                        <TableHead className="w-[100px] text-right font-semibold"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {offices.map((office) => (
                                        <TableRow key={office.id}>
                                            <TableCell className="font-medium">
                                                {office.nama}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {office.kode || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {office.pic?.length || 0} orang
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    nativeButton={false}
                                                    render={
                                                        <Link
                                                            href={`/kantor/${office.id}`}
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

export default KantorPage;
