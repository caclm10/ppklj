import Link from "next/link";
import { notFound } from "next/navigation";
import {
    PlusIcon,
    DoorOpenIcon,
    ArrowRightIcon,
    LayersIcon,
} from "lucide-react";
import type { RecordModel } from "pocketbase";
import { ClientResponseError } from "pocketbase";

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

interface PageProps {
    params: Promise<{ id: string }>;
}

async function OfficeRoomsPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let office;
    try {
        office = await pb.collection("offices").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    let rooms: RecordModel[] = [];
    try {
        const filter = pb.filter("office_id ~ {:officeId}", { officeId: id });
        rooms = await pb.collection("office_rooms").getFullList({ filter });
    } catch (error) {
        console.error("Failed to fetch office rooms:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title={`Ruangan - ${office.nama}`}
                backTo={`/kantor/${id}`}
                action={
                    <Button
                        type="button"
                        nativeButton={false}
                        render={<Link href={`/kantor/${id}/rooms/create`} />}
                    >
                        <PlusIcon data-icon="inline-start" />
                        Tambah Ruangan
                    </Button>
                }
            />

            {rooms.length === 0 ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <DoorOpenIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada ruangan</EmptyTitle>
                        <EmptyDescription>
                            Silakan tambahkan ruangan untuk kantor{" "}
                            <strong>{office.nama}</strong>.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            nativeButton={false}
                            render={
                                <Link href={`/kantor/${id}/rooms/create`} />
                            }
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah Ruangan
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <Card className="overflow-hidden py-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">
                                    Nama Ruangan
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Lantai
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Kode Ruangan
                                </TableHead>
                                <TableHead className="w-[100px] text-right font-semibold"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell className="font-medium">
                                        {room.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <LayersIcon className="size-3.5 text-muted-foreground" />
                                            {room.floor}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {room.code || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={`/kantor/${id}/rooms/${room.id}`}
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

export default OfficeRoomsPage;
