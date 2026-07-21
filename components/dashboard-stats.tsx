"use client";

import {
    AlertTriangleIcon,
    BoxesIcon,
    CheckCircle2Icon,
    XCircleIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
    totalAssets: number;
    baik: number;
    rusak: number;
    rusakBerat: number;
}

function DashboardStats({
    totalAssets,
    baik,
    rusak,
    rusakBerat,
}: DashboardStatsProps) {
    const items = [
        {
            label: "Total Aset",
            value: totalAssets,
            icon: BoxesIcon,
            className: "text-foreground",
        },
        {
            label: "Status Baik",
            value: baik,
            icon: CheckCircle2Icon,
            className: "text-green-600",
        },
        {
            label: "Status Rusak",
            value: rusak,
            icon: XCircleIcon,
            className: "text-yellow-600",
        },
        {
            label: "Status Rusak Berat",
            value: rusakBerat,
            icon: AlertTriangleIcon,
            className: "text-red-600",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.label}
                        </CardTitle>
                        <item.icon className={`size-4 ${item.className}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export { DashboardStats };
