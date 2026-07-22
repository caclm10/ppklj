import type { RecordModel } from "pocketbase";

import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardRecentActivities } from "@/components/dashboard-recent-activities";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardWarningCard } from "@/components/dashboard-warning-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { requireAuth } from "@/lib/server/pocketbase";

function firstId(value: unknown): string {
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === "string" && value) return value;
    return "";
}

async function DashboardPage() {
    const pb = await requireAuth();

    let assets: RecordModel[] = [];
    let offices: RecordModel[] = [];
    let activities: RecordModel[] = [];

    try {
        assets = await pb.collection("assets").getFullList({
            expand: "office_id",
        });
    } catch (error) {
        console.error("Failed to fetch assets:", error);
    }

    try {
        offices = await pb.collection("offices").getFullList({
            sort: "nama",
        });
    } catch (error) {
        console.error("Failed to fetch offices:", error);
    }

    try {
        activities = await pb.collection("asset_activities").getFullList({
            sort: "-date",
        });
    } catch (error) {
        console.error("Failed to fetch activities:", error);
    }

    const maintenances = activities.filter((a) => a.type === "maintenance");
    const mutations = activities.filter((a) => a.type === "mutasi");

    const officeNameById = new Map<string, string>();
    for (const office of offices) {
        officeNameById.set(office.id, String(office.nama || "Tidak diketahui"));
    }

    const totalAssets = assets.length;
    const statusCounts = {
        baik: 0,
        rusak: 0,
        "rusak berat": 0,
    };

    const assetsByOffice = new Map<string, number>();
    for (const asset of assets) {
        const status = String(asset.status || "");
        if (status in statusCounts) {
            statusCounts[status as keyof typeof statusCounts] += 1;
        }

        const officeId = firstId(asset.office_id);
        const name = officeId
            ? officeNameById.get(officeId) || "Tidak diketahui"
            : "Belum ditugaskan";
        assetsByOffice.set(name, (assetsByOffice.get(name) || 0) + 1);
    }

    const officeChartData = Array.from(assetsByOffice.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const recentMaintenances = maintenances.slice(0, 5);
    const recentMutations = mutations.slice(0, 5);

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader title="Dashboard" />

            <DashboardStats
                totalAssets={totalAssets}
                baik={statusCounts.baik}
                rusak={statusCounts.rusak}
                rusakBerat={statusCounts["rusak berat"]}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardWarningCard
                    title="Mendekati End of Support"
                    description="Aset dengan masa support yang akan berakhir dalam 2 tahun."
                    assets={assets}
                    dateField="support_until"
                    warningYears={2}
                    emptyMessage="Tidak ada aset yang mendekati EOS."
                />
                <DashboardWarningCard
                    title="Mendekati End of Warranty"
                    description="Aset dengan masa garansi yang akan berakhir dalam 1 tahun."
                    assets={assets}
                    dateField="warranty_until"
                    warningYears={1}
                    emptyMessage="Tidak ada aset yang mendekati EOW."
                />
            </div>

            <DashboardCharts
                assetsByOffice={officeChartData}
                maintenances={maintenances}
                mutations={mutations}
            />

            <DashboardRecentActivities
                maintenances={recentMaintenances}
                mutations={recentMutations}
            />
        </div>
    );
}

export default DashboardPage;
