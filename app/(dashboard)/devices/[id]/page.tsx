import Link from "next/link";
import { notFound } from "next/navigation";
import {
    CpuIcon,
    EditIcon,
    LayersIcon,
    TagIcon,
} from "lucide-react";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeleteDeviceModelButton } from "@/components/delete-device-model-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function DeviceModelDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let model;
    try {
        model = await pb.collection("device_models").getOne(id, {
            expand: "device_category_id",
        });
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Detail Model Perangkat"
                backTo="/devices"
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/devices/${id}/edit`} />}
                        >
                            <EditIcon data-icon="inline-start" />
                            Edit Model
                        </Button>
                        <DeleteDeviceModelButton
                            id={id}
                            name={`${model.vendor} ${model.model}`}
                        />
                    </div>
                }
            />

            <Card className="max-w-2xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <CpuIcon className="size-5 text-muted-foreground" />
                        <span>Profil Model</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Vendor
                            </span>
                            <span className="text-base font-medium">
                                {model.vendor}
                            </span>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Model
                            </span>
                            <div className="flex items-center gap-2">
                                <TagIcon className="size-4 text-muted-foreground" />
                                <span className="text-base">{model.model}</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Kategori
                            </span>
                            <div className="flex items-center gap-2">
                                <LayersIcon className="size-4 text-muted-foreground" />
                                <span className="text-base">
                                    {model.expand?.device_category_id?.name ||
                                        "-"}
                                </span>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DeviceModelDetailPage;
