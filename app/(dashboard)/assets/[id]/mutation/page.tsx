import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { ClientResponseError } from "pocketbase";

import { AssetMutationForm } from "@/components/asset-mutation-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function AssetMutationPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let asset: RecordModel;
    let offices: RecordModel[] = [];
    let rooms: RecordModel[] = [];

    try {
        asset = await pb
            .collection("assets")
            .getFirstListItem(pb.filter("id = {:id} && deleted = null", { id }));

        const [officesResult, roomsResult] = await Promise.all([
            pb.collection("offices").getFullList({ sort: "nama" }),
            pb.collection("office_rooms").getFullList({ sort: "name" }),
        ]);

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
        </div>
    );
}

export default AssetMutationPage;
