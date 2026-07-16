import Link from "next/link";
import { notFound } from "next/navigation";
import {
    CalendarIcon,
    ClockIcon,
    FileTextIcon,
    MailIcon,
    PhoneIcon,
    UserIcon,
    EditIcon,
} from "lucide-react";
import { ClientResponseError } from "pocketbase";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/server/pocketbase";

interface PageProps {
    params: Promise<{ id: string }>;
}

function formatWhatsAppLink(num: string) {
    const clean = num.replace(/\D/g, "");
    if (clean.startsWith("0")) {
        return `https://wa.me/62${clean.slice(1)}`;
    }
    return `https://wa.me/${clean}`;
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
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

async function PICDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pb = await requireAuth();

    let pic;
    try {
        pic = await pb.collection("pic").getOne(id);
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Detail PIC"
                backTo="/pic"
                action={
                    <Button
                        type="button"
                        nativeButton={false}
                        render={<Link href={`/pic/${id}/edit`} />}
                    >
                        <EditIcon className="size-4" />
                        Edit PIC
                    </Button>
                }
            />

            <Card className="max-w-2xl">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="size-5 text-muted-foreground" />
                        <span>Profil PIC</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nama Lengkap
                            </span>
                            <span className="text-base font-medium">
                                {pic.name}
                            </span>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nomor WhatsApp
                            </span>
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="size-4 text-muted-foreground" />
                                <a
                                    href={formatWhatsAppLink(
                                        pic.whatsapp_number
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-primary hover:underline"
                                >
                                    {pic.whatsapp_number}
                                </a>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                NIP
                            </span>
                            <span className="text-base">
                                {pic.nip || (
                                    <span className="text-muted-foreground italic">
                                        Tidak diisi
                                    </span>
                                )}
                            </span>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Email
                            </span>
                            {pic.email ? (
                                <div className="flex items-center gap-2">
                                    <MailIcon className="size-4 text-muted-foreground" />
                                    <a
                                        href={`mailto:${pic.email}`}
                                        className="text-base text-primary hover:underline"
                                    >
                                        {pic.email}
                                    </a>
                                </div>
                            ) : (
                                <span className="text-muted-foreground italic">
                                    Tidak diisi
                                </span>
                            )}
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Surat Keputusan
                            </span>
                            <div className="flex items-start gap-2">
                                <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <span className="text-base">
                                    {pic.surat_keputusan || (
                                        <span className="text-muted-foreground italic">
                                            Tidak diisi
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-1">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Dibuat Pada
                                </span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarIcon className="size-4" />
                                    <span>{formatDate(pic.created)}</span>
                                </div>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Pembaruan Terakhir
                                </span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ClockIcon className="size-4" />
                                    <span>{formatDate(pic.updated)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default PICDetailPage;
