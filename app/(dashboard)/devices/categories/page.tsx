import Link from "next/link";
import { PlusIcon, LayersIcon, ArrowRightIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
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

async function DeviceCategoriesPage() {
    const pb = await requireAuth();

    let categories: RecordModel[] = [];
    try {
        categories = await pb.collection("device_categories").getFullList({
            sort: "name",
        });
    } catch (error) {
        console.error("Failed to fetch device categories:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Kategori Perangkat"
                backTo="/devices"
                action={
                    <Button
                        type="button"
                        nativeButton={false}
                        render={<Link href="/devices/categories/create" />}
                    >
                        <PlusIcon data-icon="inline-start" />
                        Tambah Kategori
                    </Button>
                }
            />

            {categories.length === 0 ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <LayersIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada kategori</EmptyTitle>
                        <EmptyDescription>
                            Silakan tambahkan kategori perangkat terlebih dahulu.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={<Link href="/devices/categories/create" />}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah Kategori
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <Card className="overflow-hidden py-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">
                                    Nama Kategori
                                </TableHead>
                                <TableHead className="w-[100px] text-right font-semibold"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={`/devices/categories/${category.id}`}
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
    );
}

export default DeviceCategoriesPage;
