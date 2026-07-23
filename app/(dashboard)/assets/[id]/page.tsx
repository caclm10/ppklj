import Link from "next/link";
import { notFound } from "next/navigation";
import {
    BadgeAlertIcon,
    BoxIcon,
    EditIcon,
    HashIcon,
    HistoryIcon,
    LinkIcon,
    MapPinIcon,
    NetworkIcon,
    StickyNoteIcon,
    WrenchIcon,
} from "lucide-react";
import type { RecordModel } from "pocketbase";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeleteAssetButton } from "@/components/delete-asset-button";
import { AssetActivityHistory } from "@/components/asset-activity-history";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/server/pocketbase";
import {
    getBadgeVariantByStatus,
    isApproachingDate,
    isExpired,
} from "@/lib/utils";

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

async function AssetDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let asset;
    let activities: RecordModel[] = [];

    try {
        asset = await pb
            .collection("assets")
            .getFirstListItem(
                pb.filter("id = {:id} && deleted = null", { id }),
                { expand: "device_model_id,office_id,room_id" }
            );

        const activitiesResult = await pb
            .collection("asset_activities")
            .getList(1, 50, {
                sort: "-date,-created",
                filter: pb.filter("asset_id = {:id}", { id }),
            });
        activities = activitiesResult.items;
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const expandedModel = Array.isArray(asset.expand?.device_model_id)
        ? asset.expand.device_model_id[0]
        : asset.expand?.device_model_id;
    const expandedOffice = Array.isArray(asset.expand?.office_id)
        ? asset.expand.office_id[0]
        : asset.expand?.office_id;
    const expandedRoom = Array.isArray(asset.expand?.room_id)
        ? asset.expand.room_id[0]
        : asset.expand?.room_id;

    const approachingSupport = isApproachingDate(asset.support_until, 2);
    const approachingWarranty = isApproachingDate(asset.warranty_until, 1);
    const supportExpired = isExpired(asset.support_until);
    const warrantyExpired = isExpired(asset.warranty_until);

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Detail Aset"
                backTo="/assets"
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/assets/${id}/edit`} />}
                        >
                            <EditIcon data-icon="inline-start" />
                            Edit Aset
                        </Button>
                        <DeleteAssetButton id={id} hostname={asset.hostname} />
                    </div>
                }
            />

            {(approachingSupport || supportExpired) && (
                <Alert variant={supportExpired ? "destructive" : "warning"}>
                    <BadgeAlertIcon />
                    <AlertTitle>Peringatan Support</AlertTitle>
                    <AlertDescription>
                        {supportExpired
                            ? `Masa support aset telah berakhir pada ${formatDate(
                                  asset.support_until
                              )}.`
                            : `Masa support aset akan berakhir pada ${formatDate(
                                  asset.support_until
                              )}.`}
                    </AlertDescription>
                </Alert>
            )}

            {(approachingWarranty || warrantyExpired) && (
                <Alert variant={warrantyExpired ? "destructive" : "warning"}>
                    <BadgeAlertIcon />
                    <AlertTitle>Peringatan Garansi</AlertTitle>
                    <AlertDescription>
                        {warrantyExpired
                            ? `Masa garansi aset telah berakhir pada ${formatDate(
                                  asset.warranty_until
                              )}.`
                            : `Masa garansi aset akan berakhir pada ${formatDate(
                                  asset.warranty_until
                              )}.`}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <BoxIcon className="size-5 text-muted-foreground" />
                            <span>Profil Aset</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Hostname
                                </span>
                                <span className="text-base font-medium">
                                    {asset.hostname}
                                </span>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Serial Number
                                    </span>
                                    <span className="font-mono text-base">
                                        {asset.serial_number}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Status
                                    </span>
                                    <Badge
                                        variant={getBadgeVariantByStatus(
                                            asset.status
                                        )}
                                        className="capitalize"
                                    >
                                        {asset.status}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Firmware
                                    </span>
                                    <span className="text-base">
                                        {asset.firmware || "-"}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Model Perangkat
                                </span>
                                <div className="flex items-center gap-2">
                                    <NetworkIcon className="size-4 text-muted-foreground" />
                                    <span className="text-base">
                                        {expandedModel
                                            ? `${expandedModel.vendor} ${expandedModel.model}`
                                            : "-"}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        IP Address
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="size-4 text-muted-foreground" />
                                        <span className="text-base">
                                            {asset.ip_address || "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        MAC Address
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <HashIcon className="size-4 text-muted-foreground" />
                                        <span className="font-mono text-base">
                                            {asset.mac_address || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Kantor
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <MapPinIcon className="size-4 text-muted-foreground" />
                                        <span className="text-base">
                                            {expandedOffice?.nama || "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Ruangan
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <BoxIcon className="size-4 text-muted-foreground" />
                                        <span className="text-base">
                                            {expandedRoom
                                                ? `${expandedRoom.name} (lantai ${expandedRoom.floor})`
                                                : "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Tahun Pembelian
                                    </span>
                                    <span className="text-base">
                                        {asset.tahun_pembelian || "-"}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Support Sampai
                                    </span>
                                    <span className="text-base">
                                        {formatDate(asset.support_until)}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Garansi Sampai
                                    </span>
                                    <span className="text-base">
                                        {formatDate(asset.warranty_until)}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Harga
                                    </span>
                                    <span className="text-base">
                                        {asset.harga != null
                                            ? new Intl.NumberFormat("id-ID", {
                                                  style: "currency",
                                                  currency: "IDR",
                                                  minimumFractionDigits: 0,
                                              }).format(Number(asset.harga))
                                            : "-"}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Catatan
                                </span>
                                <div className="flex items-start gap-2">
                                    <StickyNoteIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <span className="text-base">
                                        {asset.notes || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        nativeButton={false}
                        render={<Link href={`/assets/${id}/maintenance`} />}
                        className="h-auto justify-start gap-3 py-4"
                    >
                        <WrenchIcon className="size-5" />
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-semibold">Maintenance</span>
                            <span className="text-xs font-normal text-muted-foreground">
                                Catat perawatan dan perbaikan aset
                            </span>
                        </div>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        nativeButton={false}
                        render={<Link href={`/assets/${id}/mutation`} />}
                        className="h-auto justify-start gap-3 py-4"
                    >
                        <MapPinIcon className="size-5" />
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-semibold">Mutasi</span>
                            <span className="text-xs font-normal text-muted-foreground">
                                Catat pemindahan lokasi aset
                            </span>
                        </div>
                    </Button>
                </div>
            </div>

            <Card className="">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <HistoryIcon className="size-5 text-muted-foreground" />
                        <span>Riwayat Aktivitas</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <AssetActivityHistory activities={activities} />
                </CardContent>
            </Card>
        </div>
    );
}

export default AssetDetailPage;
