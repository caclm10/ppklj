import Link from "next/link";
import { notFound } from "next/navigation";
import {
    EditIcon,
    LayersIcon,
} from "lucide-react";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeleteDeviceCategoryButton } from "@/components/delete-device-category-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function DeviceCategoryDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let category;
    try {
        category = await pb.collection("device_categories").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Detail Kategori Perangkat"
                backTo="/devices/categories"
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={
                                <Link href={`/devices/categories/${id}/edit`} />
                            }
                        >
                            <EditIcon data-icon="inline-start" />
                            Edit Kategori
                        </Button>
                        <DeleteDeviceCategoryButton
                            id={id}
                            name={category.name}
                        />
                    </div>
                }
            />

            <Card className="max-w-2xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <LayersIcon className="size-5 text-muted-foreground" />
                        <span>Profil Kategori</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nama Kategori
                            </span>
                            <span className="text-base font-medium">
                                {category.name}
                            </span>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DeviceCategoryDetailPage;
