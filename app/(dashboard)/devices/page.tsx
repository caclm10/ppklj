import Link from "next/link";
import { PlusIcon, CpuIcon, ArrowRightIcon } from "lucide-react";
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
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        page?: string;
    }>;
}

async function DevicesPage({ searchParams }: PageProps) {
    const pb = await requireAuth();
    const params = await searchParams;

    const searchQuery = params.search || "";
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));
    const itemsPerPage = 10;

    let models: RecordModel[] = [];
    let totalItems = 0;
    let totalPages = 0;

    try {
        const filterParts = [];
        if (searchQuery) {
            filterParts.push(
                `(vendor ~ "${searchQuery}" || model ~ "${searchQuery}")`
            );
        }

        const resultList = await pb
            .collection("device_models")
            .getList(currentPage, itemsPerPage, {
                sort: "vendor,model",
                expand: "device_category_id",
                filter: filterParts.length > 0 ? filterParts.join(" && ") : "",
            });

        models = resultList.items;
        totalItems = resultList.totalItems;
        totalPages = resultList.totalPages;
    } catch (error) {
        console.error("Failed to fetch device models list:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Model Perangkat"
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/devices/categories" />}
                        >
                            Kategori
                        </Button>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/devices/create" />}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah Model
                        </Button>
                    </div>
                }
            />

            {models.length === 0 && !searchQuery ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CpuIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada model perangkat</EmptyTitle>
                        <EmptyDescription>
                            Silakan tambahkan model perangkat beserta kategorinya.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/devices/create" />}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah Model
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="flex flex-col gap-4">
                    <TableControl
                        searchPlaceholder="Cari vendor atau model..."
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                    />

                    {models.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center text-card-foreground">
                            <span className="text-sm font-medium text-muted-foreground">
                                Tidak ditemukan model yang cocok dengan
                                pencarian Anda.
                            </span>
                        </div>
                    ) : (
                        <Card className="overflow-hidden py-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Vendor
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Model
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Kategori
                                        </TableHead>
                                        <TableHead className="w-[100px] text-right font-semibold"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {models.map((model) => (
                                        <TableRow key={model.id}>
                                            <TableCell className="font-medium">
                                                {model.vendor}
                                            </TableCell>
                                            <TableCell>{model.model}</TableCell>
                                            <TableCell>
                                                {model.expand
                                                    ?.device_category_id
                                                    ?.name || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    nativeButton={false}
                                                    render={
                                                        <Link
                                                            href={`/devices/${model.id}`}
                                                        />
                                                    }
                                                >
                                                    <span>Detail</span>
                                                    <ArrowRightIcon data-icon="inline-end" />
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

export default DevicesPage;
