import Link from "next/link";
import { notFound } from "next/navigation";
import {
    BuildingIcon,
    UserIcon,
    EditIcon,
    PhoneIcon,
    MailIcon,
    DoorOpenIcon,
} from "lucide-react";
import { ClientResponseError, type RecordModel } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { DeleteOfficeButton } from "@/components/delete-office-button";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function KantorDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let office;
    try {
        office = await pb.collection("offices").getOne(id, {
            expand: "pic",
        });
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const expandedPics = office.expand?.pic || [];

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Detail Kantor"
                backTo="/kantor"
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/kantor/${id}/rooms`} />}
                        >
                            <DoorOpenIcon data-icon="inline-start" />
                            Ruangan
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/kantor/${id}/edit`} />}
                        >
                            <EditIcon data-icon="inline-start" />
                            Edit Kantor
                        </Button>
                        <DeleteOfficeButton id={id} nama={office.nama} />
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <BuildingIcon className="size-5 text-muted-foreground" />
                            <span>Profil Kantor</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Nama Kantor
                                </span>
                                <span className="text-base font-medium">
                                    {office.nama}
                                </span>
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Kode Kantor
                                </span>
                                <span className="text-base">
                                    {office.kode || (
                                        <span className="text-muted-foreground italic">
                                            Tidak diisi
                                        </span>
                                    )}
                                </span>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <Card className="flex max-h-[500px] flex-col">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="size-5 text-muted-foreground" />
                            <span>PIC Terkait</span>
                        </CardTitle>
                        <CardDescription>
                            Daftar penanggung jawab untuk kantor ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pt-6">
                        {expandedPics.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground italic">
                                Belum ada PIC yang dihubungkan ke kantor ini.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {expandedPics.map((pic: RecordModel) => (
                                    <div
                                        key={pic.id}
                                        className="group relative flex flex-col gap-1.5 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                    >
                                        <div className="flex items-center justify-between text-sm font-semibold">
                                            <span>{pic.name}</span>
                                            <Link
                                                href={`/pic/${pic.id}`}
                                                className="text-xs font-normal text-primary hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Detail PIC →
                                            </Link>
                                        </div>
                                        {pic.nip && (
                                            <div className="font-mono text-xs text-muted-foreground">
                                                NIP: {pic.nip}
                                            </div>
                                        )}
                                        <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <PhoneIcon className="size-3" />
                                                <span>
                                                    {pic.whatsapp_number}
                                                </span>
                                            </div>
                                            {pic.email && (
                                                <div className="flex items-center gap-1">
                                                    <MailIcon className="size-3" />
                                                    <span>{pic.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default KantorDetailPage;
