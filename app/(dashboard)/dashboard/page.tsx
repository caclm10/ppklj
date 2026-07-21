import type { RecordModel } from "pocketbase";

import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardRecentActivities } from "@/components/dashboard-recent-activities";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardHeader } from "@/components/dashboard-header";
import { requireAuth } from "@/lib/server/pocketbase";

function firstId(value: unknown): string {
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === "string" && value) return value;
    return "";
}

function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDayKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildMonthlyData(records: RecordModel[]) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const months: { date: string; count: number; key: string }[] = [];

    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, i, 1);
        months.push({
            date: getDayKey(date),
            count: 0,
            key: getMonthKey(date),
        });
    }

    const counts = new Map<string, number>();
    for (const record of records) {
        const date = new Date(record.date);
        if (Number.isNaN(date.getTime())) continue;
        const key = getMonthKey(date);
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    for (const item of months) {
        item.count = counts.get(item.key) || 0;
    }

    return months.map(({ date, count }) => ({ date, count }));
}

function startOfWeek(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    return copy;
}

function buildWeeklyData(records: RecordModel[]) {
    const monday = startOfWeek(new Date());
    const daysList: { date: string; count: number; key: string }[] = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        daysList.push({
            date: getDayKey(date),
            count: 0,
            key: getDayKey(date),
        });
    }

    const counts = countByDayKey(records);
    for (const item of daysList) {
        item.count = counts.get(item.key) || 0;
    }

    return daysList.map(({ date, count }) => ({ date, count }));
}

function buildMonthlyCalendarData(records: RecordModel[]) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysList: { date: string; count: number; key: string }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        daysList.push({
            date: getDayKey(date),
            count: 0,
            key: getDayKey(date),
        });
    }

    const counts = countByDayKey(records);
    for (const item of daysList) {
        item.count = counts.get(item.key) || 0;
    }

    return daysList.map(({ date, count }) => ({ date, count }));
}

function countByDayKey(records: RecordModel[]) {
    const counts = new Map<string, number>();
    for (const record of records) {
        const date = new Date(record.date);
        if (Number.isNaN(date.getTime())) continue;
        date.setHours(0, 0, 0, 0);
        const key = getDayKey(date);
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
}

async function DashboardPage() {
    const pb = await requireAuth();

    let assets: RecordModel[] = [];
    let offices: RecordModel[] = [];
    let maintenances: RecordModel[] = [];
    let mutations: RecordModel[] = [];

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
        maintenances = await pb.collection("asset_maintenances").getFullList({
            sort: "-date",
        });
    } catch (error) {
        console.error("Failed to fetch maintenances:", error);
    }

    try {
        mutations = await pb.collection("asset_mutations").getFullList({
            sort: "-date",
        });
    } catch (error) {
        console.error("Failed to fetch mutations:", error);
    }

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

    const maintenanceMonthly = buildMonthlyData(maintenances);
    const maintenanceWeekly = buildWeeklyData(maintenances);
    const maintenanceMonthlyCalendar = buildMonthlyCalendarData(maintenances);
    const mutationMonthly = buildMonthlyData(mutations);
    const mutationWeekly = buildWeeklyData(mutations);
    const mutationMonthlyCalendar = buildMonthlyCalendarData(mutations);

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

            <DashboardCharts
                assetsByOffice={officeChartData}
                maintenancesMonthly={maintenanceMonthly}
                maintenancesWeekly={maintenanceWeekly}
                maintenancesMonthlyCalendar={maintenanceMonthlyCalendar}
                mutationsMonthly={mutationMonthly}
                mutationsWeekly={mutationWeekly}
                mutationsMonthlyCalendar={mutationMonthlyCalendar}
            />

            <DashboardRecentActivities
                maintenances={recentMaintenances}
                mutations={recentMutations}
            />
        </div>
    );
}

export default DashboardPage;
