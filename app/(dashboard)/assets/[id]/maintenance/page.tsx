import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, WrenchIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { ClientResponseError } from "pocketbase";

import { AssetMaintenanceForm } from "@/components/asset-maintenance-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

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

function formatFieldName(field: string) {
    const labels: Record<string, string> = {
        device_model_id: "Model Perangkat",
        serial_number: "Serial Number",
        hostname: "Hostname",
        ip_address: "IP Address",
        mac_address: "MAC Address",
        status: "Status",
        firmware: "Firmware",
        tahun_pembelian: "Tahun Pembelian",
        support_until: "Support Sampai",
        warranty_until: "Garansi Sampai",
        notes: "Catatan",
        office_id: "Kantor",
        room_id: "Ruangan",
    };
    return labels[field] || field;
}

function formatFieldValue(value: unknown) {
    if (value === undefined || value === null || value === "") return "-";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
    return String(value);
}

function maintenanceTypeLabel(type: string, typeOther?: string) {
    if (type === "lainnya") return typeOther || "Lainnya";
    return type.charAt(0).toUpperCase() + type.slice(1);
}

async function AssetMaintenancePage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let asset;
    let maintenances: RecordModel[] = [];

    try {
        asset = await pb.collection("assets").getOne(id);

        const result = await pb
            .collection("asset_maintenances")
            .getList(1, 50, {
                sort: "-date,-created",
                filter: pb.filter("asset_id = {:id}", { id }),
            });
        maintenances = result.items;
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/assets/${id}`} />}
                >
                    <ArrowLeftIcon data-icon="inline-start" />
                    Kembali
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Maintenance: {asset.hostname}
                </h1>
            </div>

            <Card className="max-w-3xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <WrenchIcon className="size-5 text-muted-foreground" />
                        <span>Catat Maintenance</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <AssetMaintenanceForm
                        assetId={id}
                        currentStatus={asset.status}
                        currentFirmware={(asset.firmware as string) || ""}
                        currentNotes={(asset.notes as string) || ""}
                    />
                </CardContent>
            </Card>

            <Card className="max-w-3xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle>Riwayat Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {maintenances.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Belum ada maintenance untuk aset ini.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {maintenances.map((maintenance) => {
                                const updates = maintenance.asset_updates
                                    ? (maintenance.asset_updates as Record<
                                          string,
                                          unknown
                                      >)
                                    : {};
                                const updateEntries = Object.entries(updates);

                                return (
                                    <div
                                        key={maintenance.id}
                                        className="grid gap-2 rounded-lg border p-3"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary">
                                                {maintenanceTypeLabel(
                                                    maintenance.type,
                                                    maintenance.type_other
                                                )}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(maintenance.date)}
                                            </span>
                                        </div>

                                        {maintenance.performed_by && (
                                            <p className="text-sm text-muted-foreground">
                                                Pelaksana:{" "}
                                                {maintenance.performed_by}
                                            </p>
                                        )}

                                        {maintenance.description && (
                                            <p className="text-sm">
                                                {maintenance.description}
                                            </p>
                                        )}

                                        {updateEntries.length > 0 && (
                                            <div className="flex flex-col gap-1 rounded-md bg-muted/30 p-2 text-sm">
                                                {updateEntries.map(
                                                    ([field, value]) => (
                                                        <div key={field}>
                                                            <span className="font-medium">
                                                                {formatFieldName(
                                                                    field
                                                                )}
                                                                :
                                                            </span>{" "}
                                                            <span className="text-muted-foreground">
                                                                {formatFieldValue(
                                                                    value
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AssetMaintenancePage;
