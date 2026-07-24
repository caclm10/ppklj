import Link from "next/link";
import { PlusIcon, BoxIcon, ArrowRightIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { TableControl } from "@/components/table-control";
import { Badge } from "@/components/ui/badge";
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
import { ImportDialog } from "@/components/import-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { importAssets, exportAssets } from "@/actions/asset";
import { ASSET_EXPORT_COLUMNS } from "@/lib/asset-export";
import { requireAuth } from "@/lib/server/pocketbase";
import { getBadgeVariantByStatus } from "@/lib/utils";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        page?: string;
    }>;
}

function modelName(model: RecordModel | undefined) {
    if (!model) return "-";
    return `${model.vendor || ""} ${model.model || ""}`.trim();
}

async function AssetsPage({ searchParams }: PageProps) {
    const pb = await requireAuth();
    const params = await searchParams;

    const searchQuery = params.search || "";
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));
    const itemsPerPage = 10;

    let assets: RecordModel[] = [];
    let totalItems = 0;
    let totalPages = 0;

    try {
        const filterParts = [`deleted = null`];
        if (searchQuery) {
            filterParts.push(
                `(hostname ~ "${searchQuery}" || serial_number ~ "${searchQuery}")`
            );
        }

        const resultList = await pb
            .collection("assets")
            .getList(currentPage, itemsPerPage, {
                sort: "-created",
                expand: "device_model_id",
                filter: filterParts.join(" && "),
            });

        assets = resultList.items;
        totalItems = resultList.totalItems;
        totalPages = resultList.totalPages;
    } catch (error) {
        console.error("Failed to fetch assets list:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Aset Perangkat"
                action={
                    <div className="flex items-center gap-2">
                        <ImportDialog
                            title="Impor Aset"
                            description="Unggah file Excel atau CSV dengan kolom wajib 'device model', 'serial number', dan 'hostname'. Jika device model belum ada, tambahkan kolom 'device category' agar dapat dibuatkan otomatis. Kolom opsional: status, ip address, mac address, firmware, tahun pembelian, support until, warranty until, notes, harga, nama kantor, nama ruangan."
                            requiredColumns={[
                                "device model",
                                "serial number",
                                "hostname",
                            ]}
                            columnLabels={{
                                "device model": "Device Model",
                                "serial number": "Serial Number",
                                hostname: "Hostname",
                            }}
                            onImport={importAssets}
                        />
                        <ExportDialog
                            title="Ekspor Aset"
                            description="Pilih kolom yang ingin diekspor ke file XLSX."
                            columns={ASSET_EXPORT_COLUMNS.map((col) => ({
                                key: col.key,
                                label: col.label,
                            }))}
                            onExport={exportAssets}
                        />
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/assets/create" />}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah Aset
                        </Button>
                    </div>
                }
            />

            {assets.length === 0 && !searchQuery ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BoxIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada aset</EmptyTitle>
                        <EmptyDescription>
                            Silakan tambahkan aset perangkat fisik ke dalam
                            sistem.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/assets/create" />}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah Aset
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="flex flex-col gap-4">
                    <TableControl
                        searchPlaceholder="Cari hostname atau serial number..."
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                    />

                    {assets.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center text-card-foreground">
                            <span className="text-sm font-medium text-muted-foreground">
                                Tidak ditemukan aset yang cocok dengan pencarian
                                Anda.
                            </span>
                        </div>
                    ) : (
                        <Card className="overflow-hidden py-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Hostname
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Serial Number
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Model
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-[100px] text-right font-semibold"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset) => {
                                        const expandedModel = Array.isArray(
                                            asset.expand?.device_model_id
                                        )
                                            ? asset.expand.device_model_id[0]
                                            : asset.expand?.device_model_id;

                                        return (
                                            <TableRow key={asset.id}>
                                                <TableCell className="font-medium">
                                                    {asset.hostname}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {asset.serial_number}
                                                </TableCell>
                                                <TableCell>
                                                    {modelName(expandedModel)}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    <Badge variant={getBadgeVariantByStatus(asset.status)}>
                                                        {asset.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        nativeButton={false}
                                                        render={
                                                            <Link
                                                                href={`/assets/${asset.id}`}
                                                            />
                                                        }
                                                    >
                                                        <span>Detail</span>
                                                        <ArrowRightIcon data-icon="inline-end" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

export default AssetsPage;
