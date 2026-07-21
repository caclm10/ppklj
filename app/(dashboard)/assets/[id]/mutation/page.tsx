import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { ClientResponseError } from "pocketbase";

import { AssetMutationForm } from "@/components/asset-mutation-form";
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

async function AssetMutationPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let asset;
    let mutations: RecordModel[] = [];
    let offices: RecordModel[] = [];
    let rooms: RecordModel[] = [];

    try {
        asset = await pb.collection("assets").getOne(id);

        const [mutationsResult, officesResult, roomsResult] = await Promise.all([
            pb.collection("asset_mutations").getList(1, 50, {
                sort: "-date,-created",
                filter: pb.filter("asset_id = {:id}", { id }),
            }),
            pb.collection("offices").getFullList({ sort: "nama" }),
            pb.collection("office_rooms").getFullList({ sort: "name" }),
        ]);

        mutations = mutationsResult.items;
        offices = officesResult;
        rooms = roomsResult;
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
                    Mutasi: {asset.hostname}
                </h1>
            </div>

            <Card className="max-w-3xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <MapPinIcon className="size-5 text-muted-foreground" />
                        <span>Catat Mutasi</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <AssetMutationForm
                        assetId={id}
                        offices={offices}
                        rooms={rooms}
                    />
                </CardContent>
            </Card>

            <Card className="max-w-3xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle>Riwayat Mutasi</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {mutations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Belum ada mutasi untuk aset ini.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {mutations.map((mutation) => (
                                <div
                                    key={mutation.id}
                                    className="grid gap-2 rounded-lg border p-3"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">Mutasi</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(mutation.date)}
                                        </span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium">Dari:</span>{" "}
                                        <span className="text-muted-foreground">
                                            {mutation.from_office_name || "-"}
                                            {mutation.from_room_name
                                                ? `, ${mutation.from_room_name}`
                                                : ""}
                                        </span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium">Ke:</span>{" "}
                                        <span className="text-muted-foreground">
                                            {mutation.to_office_name || "-"}
                                            {mutation.to_room_name
                                                ? `, ${mutation.to_room_name}`
                                                : ""}
                                        </span>
                                    </div>

                                    {mutation.notes && (
                                        <p className="text-sm text-muted-foreground">
                                            {mutation.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AssetMutationPage;
