import Link from "next/link";
import { PlusIcon, UserIcon, ArrowRightIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

async function PICPage() {
    const pb = await requireAuth();

    let pics: RecordModel[] = [];
    try {
        pics = await pb.collection("pic").getFullList({
            sort: "-created",
        });
    } catch (error) {
        console.error("Failed to fetch PIC list:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Daftar PIC"
                action={
                    <Button
                        type="button"
                        nativeButton={false}
                        render={<Link href="/pic/create" />}
                    >
                        <PlusIcon />
                        Tambah PIC
                    </Button>
                }
            />

            {pics.length === 0 ? (
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
                                    <TableCell>{pic.whatsapp_number}</TableCell>
                                    <TableCell>{pic.email || "-"}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {pic.surat_keputusan || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            nativeButton={false}
                                            render={
                                                <Link href={`/pic/${pic.id}`} />
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
    );
}

export default PICPage;
