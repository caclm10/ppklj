import Link from "next/link";
import { notFound } from "next/navigation";
import {
    DoorOpenIcon,
    EditIcon,
    LayersIcon,
    TagIcon,
} from "lucide-react";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeleteOfficeRoomButton } from "@/components/delete-office-room-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string; roomId: string }>;
}

async function OfficeRoomDetailPage({ params }: PageProps) {
    const { id, roomId } = await params;
    const pb = await requireAuth();

    let room;
    try {
        room = await pb.collection("office_rooms").getOne(roomId);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const officeIds: string[] = room.office_id || [];
    if (!officeIds.includes(id)) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Detail Ruangan"
                backTo={`/kantor/${id}/rooms`}
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={
                                <Link href={`/kantor/${id}/rooms/${roomId}/edit`} />
                            }
                        >
                            <EditIcon data-icon="inline-start" />
                            Edit Ruangan
                        </Button>
                        <DeleteOfficeRoomButton
                            roomId={roomId}
                            officeId={id}
                            name={room.name}
                        />
                    </div>
                }
            />

            <Card className="max-w-2xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <DoorOpenIcon className="size-5 text-muted-foreground" />
                        <span>Profil Ruangan</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nama Ruangan
                            </span>
                            <span className="text-base font-medium">
                                {room.name}
                            </span>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Lantai
                            </span>
                            <div className="flex items-center gap-2">
                                <LayersIcon className="size-4 text-muted-foreground" />
                                <span className="text-base">{room.floor}</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Kode Ruangan
                            </span>
                            <div className="flex items-center gap-2">
                                <TagIcon className="size-4 text-muted-foreground" />
                                <span className="text-base font-mono">
                                    {room.code || (
                                        <span className="text-muted-foreground italic">
                                            Tidak diisi
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default OfficeRoomDetailPage;
