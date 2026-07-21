"use client";

import type { RecordModel } from "pocketbase";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DashboardRecentActivitiesProps {
    maintenances: RecordModel[];
    mutations: RecordModel[];
}

function formatDate(value: string | undefined | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getAssetName(snapshot: unknown): string {
    if (
        typeof snapshot === "object" &&
        snapshot !== null &&
        "hostname" in snapshot
    ) {
        return String(snapshot.hostname || "-");
    }
    return "-";
}

function stripHtml(html: string | undefined | null): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function DashboardRecentActivities({
    maintenances,
    mutations,
}: DashboardRecentActivitiesProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>5 Maintenance Terakhir</CardTitle>
                    <CardDescription>
                        Daftar maintenance aset yang paling baru dilakukan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {maintenances.length === 0 ? (
                        <p className="px-6 text-sm text-muted-foreground">
                            Belum ada maintenance.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Aset</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {maintenances.map((maintenance) => (
                                    <TableRow key={maintenance.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(maintenance.date)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {getAssetName(
                                                maintenance.asset_snapshot
                                            )}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {maintenance.type === "lainnya"
                                                ? maintenance.type_other || "Lainnya"
                                                : String(maintenance.type || "-")}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                            {stripHtml(maintenance.description) ||
                                                "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>5 Mutasi Terakhir</CardTitle>
                    <CardDescription>
                        Daftar mutasi aset yang paling baru dilakukan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {mutations.length === 0 ? (
                        <p className="px-6 text-sm text-muted-foreground">
                            Belum ada mutasi.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Aset</TableHead>
                                    <TableHead>Dari</TableHead>
                                    <TableHead>Ke</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mutations.map((mutation) => (
                                    <TableRow key={mutation.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(mutation.date)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {getAssetName(
                                                mutation.asset_snapshot
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {String(
                                                mutation.from_office_name || "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {String(
                                                mutation.to_office_name || "-"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export { DashboardRecentActivities };
