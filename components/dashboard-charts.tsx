"use client";

import { useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface DashboardChartsProps {
    assetsByOffice: { name: string; count: number }[];
    maintenancesMonthly: { date: string; count: number }[];
    maintenancesWeekly: { date: string; count: number }[];
    maintenancesMonthlyCalendar: { date: string; count: number }[];
    mutationsMonthly: { date: string; count: number }[];
    mutationsWeekly: { date: string; count: number }[];
    mutationsMonthlyCalendar: { date: string; count: number }[];
}

const officeChartConfig = {
    count: {
        label: "Jumlah Aset",
        color: "var(--chart-1)",
    },
};

const maintenanceChartConfig = {
    count: {
        label: "Maintenance",
        color: "var(--chart-2)",
    },
};

const mutationChartConfig = {
    count: {
        label: "Mutasi",
        color: "var(--chart-3)",
    },
};

interface ActivityChartProps {
    title: string;
    description: string;
    monthlyData: { date: string; count: number }[];
    weeklyData: { date: string; count: number }[];
    monthlyCalendarData: { date: string; count: number }[];
    config: Record<string, { label?: string; color?: string }>;
    gradientId: string;
    strokeColor: string;
}

type ViewMode = "month" | "day";
type DayRange = "week" | "month";

function formatMonthTick(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleString("id-ID", { month: "short", year: "numeric" });
}

function formatWeekdayTick(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleString("id-ID", { weekday: "long" });
}

function formatDayTick(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return String(date.getDate());
}

function ActivityChart({
    title,
    description,
    monthlyData,
    weeklyData,
    monthlyCalendarData,
    config,
    gradientId,
    strokeColor,
}: ActivityChartProps) {
    const [mode, setMode] = useState<ViewMode>("month");
    const [dayRange, setDayRange] = useState<DayRange>("week");

    const currentDayData =
        dayRange === "week" ? weeklyData : monthlyCalendarData;
    const data = mode === "month" ? monthlyData : currentDayData;

    const tickFormatter =
        mode === "month"
            ? formatMonthTick
            : dayRange === "week"
              ? formatWeekdayTick
              : formatDayTick;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                        <div className="flex gap-1 rounded-lg border p-1">
                            <Button
                                type="button"
                                variant={mode === "month" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setMode("month")}
                            >
                                Bulan
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "day" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setMode("day")}
                            >
                                Hari
                            </Button>
                        </div>
                        {mode === "day" && (
                            <div className="flex gap-1 rounded-lg border p-1">
                                <Button
                                    type="button"
                                    variant={
                                        dayRange === "week" ? "secondary" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setDayRange("week")}
                                >
                                    7 hari
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        dayRange === "month" ? "secondary" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setDayRange("month")}
                                >
                                    1 bulan
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={config}
                    className="min-h-[250px] w-full"
                >
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id={gradientId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={strokeColor}
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={strokeColor}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={tickFormatter}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        const date = new Date(value);
                                        if (Number.isNaN(date.getTime())) {
                                            return value;
                                        }
                                        return date.toLocaleDateString(
                                            "id-ID",
                                            {
                                                month: "long",
                                                day: "numeric",
                                            }
                                        );
                                    }}
                                />
                            }
                        />
                        <Area
                            dataKey="count"
                            type="monotone"
                            fill={`url(#${gradientId})`}
                            stroke={strokeColor}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function DashboardCharts({
    assetsByOffice,
    maintenancesMonthly,
    maintenancesWeekly,
    maintenancesMonthlyCalendar,
    mutationsMonthly,
    mutationsWeekly,
    mutationsMonthlyCalendar,
}: DashboardChartsProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Jumlah Aset per Kantor</CardTitle>
                    <CardDescription>
                        Perbandingan jumlah aset yang ditugaskan ke setiap
                        kantor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={officeChartConfig}
                        className="min-h-[300px] w-full"
                    >
                        <BarChart data={assetsByOffice}>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                angle={-30}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--chart-1)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <ActivityChart
                title="Maintenance"
                description="Jumlah aktivitas maintenance aset."
                monthlyData={maintenancesMonthly}
                weeklyData={maintenancesWeekly}
                monthlyCalendarData={maintenancesMonthlyCalendar}
                config={maintenanceChartConfig}
                gradientId="fillMaintenance"
                strokeColor="var(--chart-2)"
            />

            <ActivityChart
                title="Mutasi"
                description="Jumlah aktivitas mutasi aset."
                monthlyData={mutationsMonthly}
                weeklyData={mutationsWeekly}
                monthlyCalendarData={mutationsMonthlyCalendar}
                config={mutationChartConfig}
                gradientId="fillMutation"
                strokeColor="var(--chart-3)"
            />
        </div>
    );
}

export { DashboardCharts };
