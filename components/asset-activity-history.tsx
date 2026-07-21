"use client";

import { useState } from "react";
import type { RecordModel } from "pocketbase";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AssetActivityHistoryProps {
    activities: RecordModel[];
}

type ActivityType = "all" | "maintenance" | "mutasi" | "hapus";

function formatDate(dateStr: string | undefined | null) {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatDateTime(dateStr: string | undefined | null) {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

function typeLabel(type: string) {
    if (type === "maintenance") return "Maintenance";
    if (type === "mutasi") return "Mutasi";
    if (type === "hapus") return "Dihapus";
    return type;
}

function typeBadgeVariant(type: string) {
    if (type === "maintenance") return "secondary";
    if (type === "mutasi") return "default";
    if (type === "hapus") return "destructive";
    return "outline";
}

function AssetActivityHistory({ activities }: AssetActivityHistoryProps) {
    const [filter, setFilter] = useState<ActivityType>("all");

    const filtered =
        filter === "all"
            ? activities
            : activities.filter((a) => a.type === filter);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    Semua
                </Button>
                <Button
                    variant={filter === "maintenance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("maintenance")}
                >
                    Maintenance
                </Button>
                <Button
                    variant={filter === "mutasi" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("mutasi")}
                >
                    Mutasi
                </Button>
                <Button
                    variant={filter === "hapus" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("hapus")}
                >
                    Dihapus
                </Button>
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Belum ada riwayat aktivitas untuk filter ini.
                </p>
            ) : (
                <div className="flex flex-col gap-6">
                    {filtered.map((activity) => {
                        const updates = activity.asset_updates
                            ? (activity.asset_updates as Record<
                                  string,
                                  string | undefined
                              >)
                            : {};

                        return (
                            <div key={activity.id} className="grid gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={typeBadgeVariant(activity.type)}>
                                        {typeLabel(activity.type)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(activity.date)}
                                    </span>
                                    {activity.performed_by && (
                                        <span className="text-sm text-muted-foreground">
                                            oleh {String(activity.performed_by)}
                                        </span>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {formatDateTime(activity.created)}
                                    </span>
                                </div>

                                {activity.type === "maintenance" && (
                                    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
                                        {updates.status && (
                                            <div className="text-sm">
                                                <span className="font-medium">
                                                    Status
                                                </span>
                                                <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                                                    <span className="capitalize">
                                                        {String(
                                                            activity.asset_snapshot
                                                                .status || "-"
                                                        )}
                                                    </span>
                                                    <span>→</span>
                                                    <span className="capitalize">
                                                        {String(updates.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {updates.firmware && (
                                            <div className="text-sm">
                                                <span className="font-medium">
                                                    Firmware
                                                </span>
                                                <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                                                    <span>
                                                        {String(
                                                            activity.asset_snapshot
                                                                .firmware || "-"
                                                        )}
                                                    </span>
                                                    <span>→</span>
                                                    <span>
                                                        {String(updates.firmware)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activity.type === "mutasi" && (
                                    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
                                        <div>
                                            <span className="font-medium">
                                                Dari
                                            </span>
                                            <p className="text-muted-foreground">
                                                {String(
                                                    updates.from_office_name || "-"
                                                )}
                                                {updates.from_room_name
                                                    ? ` — ${String(updates.from_room_name)}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Ke
                                            </span>
                                            <p className="text-muted-foreground">
                                                {String(updates.office_name || "-")}
                                                {updates.room_name
                                                    ? ` — ${String(updates.room_name)}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activity.notes && (
                                    <p className="text-sm text-muted-foreground">
                                        {String(activity.notes)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export { AssetActivityHistory };
