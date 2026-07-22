import { HistoryIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { TableControl } from "@/components/table-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
        type?: string;
        page?: string;
    }>;
}

const activityTypes = [
    { value: "all", label: "Semua Tipe" },
    { value: "maintenance", label: "Maintenance" },
    { value: "mutasi", label: "Mutasi" },
    { value: "hapus", label: "Dihapus" },
];

function typeLabel(type: string) {
    if (type === "maintenance") return "Maintenance";
    if (type === "mutasi") return "Mutasi";
    if (type === "hapus") return "Dihapus";
    return type;
}

function typeBadgeVariant(type: string) {
    if (type === "maintenance") return "maintenance";
    if (type === "mutasi") return "mutation";
    if (type === "hapus") return "destructive";
    return "outline";
}

function formatDate(dateStr: string | undefined | null) {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
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

function getActivityDescription(activity: RecordModel): string {
    const updates = activity.asset_updates
        ? (activity.asset_updates as Record<string, unknown>)
        : {};

    if (activity.type === "maintenance") {
        const parts: string[] = [];
        if (updates.status) parts.push(`status → ${String(updates.status)}`);
        if (updates.firmware) parts.push(`firmware → ${String(updates.firmware)}`);
        return parts.join(", ") || stripHtml(String(activity.notes || "")) || "-";
    }

    if (activity.type === "mutasi") {
        const from = String(updates.from_office_name || "-");
        const to = String(updates.office_name || "-");
        return `${from} → ${to}`;
    }

    return stripHtml(String(activity.notes || "")) || "-";
}

async function ActivitiesPage({ searchParams }: PageProps) {
    const pb = await requireAuth();
    const params = await searchParams;

    const searchQuery = params.search || "";
    const typeFilter = params.type || "all";
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));
    const itemsPerPage = 10;

    let activities: RecordModel[] = [];
    let totalItems = 0;
    let totalPages = 0;

    try {
        const filterParts = [];
        if (typeFilter && typeFilter !== "all") {
            filterParts.push(`type = "${typeFilter}"`);
        }

        const resultList = await pb
            .collection("asset_activities")
            .getList(currentPage, itemsPerPage, {
                sort: "-date,-created",
                filter: filterParts.length > 0 ? filterParts.join(" && ") : "",
            });

        activities = resultList.items;
        totalItems = resultList.totalItems;
        totalPages = resultList.totalPages;

        if (searchQuery) {
            const lowerSearch = searchQuery.toLowerCase();
            activities = activities.filter((activity) => {
                const hostname = getAssetName(activity.asset_snapshot).toLowerCase();
                const performer = String(activity.performed_by || "").toLowerCase();
                const notes = stripHtml(String(activity.notes || "")).toLowerCase();
                return (
                    hostname.includes(lowerSearch) ||
                    performer.includes(lowerSearch) ||
                    notes.includes(lowerSearch)
                );
            });
        }
    } catch (error) {
        console.error("Failed to fetch activities:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader title="Aktivitas Aset" />

            {activities.length === 0 && !searchQuery && typeFilter === "all" ? (
                <Empty className="min-h-[400px] border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <HistoryIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada aktivitas</EmptyTitle>
                        <EmptyDescription>
                            Semua aktivitas maintenance, mutasi, dan penghapusan
                            aset akan muncul di sini.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <TableControl
                            searchPlaceholder="Cari hostname, pelaksana, atau catatan..."
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                        />

                        <form
                            method="get"
                            className="flex items-center gap-2"
                        >
                            {searchQuery && (
                                <input type="hidden" name="search" value={searchQuery} />
                            )}
                            <Select name="type" defaultValue={typeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {activityTypes.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" size="sm">
                                Filter
                            </Button>
                        </form>
                    </div>

                    {activities.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center text-card-foreground">
                            <span className="text-sm font-medium text-muted-foreground">
                                Tidak ditemukan aktivitas yang cocok.
                            </span>
                        </div>
                    ) : (
                        <Card className="overflow-hidden py-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Tanggal
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Tipe
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Aset
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Pelaksana
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Keterangan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {formatDate(activity.date)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={typeBadgeVariant(
                                                        activity.type
                                                    )}
                                                >
                                                    {typeLabel(activity.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {getAssetName(
                                                    activity.asset_snapshot
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {activity.performed_by || "-"}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">
                                                {getActivityDescription(activity)}
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

export default ActivitiesPage;
