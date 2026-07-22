"use client";

import { useMemo, useState } from "react";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";
import type { RecordModel } from "pocketbase";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardChartsProps {
    assetsByOffice: { name: string; count: number }[];
    maintenances: RecordModel[];
    mutations: RecordModel[];
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
    activities: RecordModel[];
    config: Record<string, { label?: string; color?: string }>;
    gradientId: string;
    strokeColor: string;
}

function buildDailyData(activities: RecordModel[], range: DateRange) {
    const from = range.from ? startOfDay(range.from) : startOfDay(new Date());
    const to = range.to ? startOfDay(range.to) : startOfDay(new Date());
    const days = Math.max(0, differenceInDays(to, from));

    const daysList: { date: string; count: number }[] = [];
    for (let i = 0; i <= days; i++) {
        const date = addDays(from, i);
        daysList.push({
            date: format(date, "yyyy-MM-dd"),
            count: 0,
        });
    }

    const counts = new Map<string, number>();
    for (const activity of activities) {
        const date = new Date(activity.date);
        if (Number.isNaN(date.getTime())) continue;
        const day = startOfDay(date);
        if (day < from || day > to) continue;
        const key = format(day, "yyyy-MM-dd");
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    for (const item of daysList) {
        item.count = counts.get(item.date) || 0;
    }

    return daysList;
}

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return format(date, "d MMM", { locale: id });
}

function DateRangePicker({
    range,
    onChange,
}: {
    range: DateRange;
    onChange: (range: DateRange) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        className="justify-start px-2.5 font-normal"
                    >
                        <CalendarIcon data-icon="inline-start" />
                        {range.from ? (
                            range.to ? (
                                <>
                                    {format(range.from, "d MMM yyyy", {
                                        locale: id,
                                    })}{" "}
                                    -{" "}
                                    {format(range.to, "d MMM yyyy", {
                                        locale: id,
                                    })}
                                </>
                            ) : (
                                format(range.from, "d MMM yyyy", {
                                    locale: id,
                                })
                            )
                        ) : (
                            <span>Pilih rentang tanggal</span>
                        )}
                    </Button>
                }
            />
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={range.from}
                    selected={range}
                    onSelect={(value) => {
                        if (value?.from && value?.to) {
                            onChange({ from: value.from, to: value.to });
                        }
                    }}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}

function ActivityChart({
    title,
    description,
    activities,
    config,
    gradientId,
    strokeColor,
}: ActivityChartProps) {
    const [range, setRange] = useState<DateRange>({
        from: addDays(new Date(), -6),
        to: new Date(),
    });

    const data = useMemo(
        () => buildDailyData(activities, range),
        [activities, range]
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <DateRangePicker range={range} onChange={setRange} />
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[250px] w-full">
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
                            tickFormatter={formatDateLabel}
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
                                                year: "numeric",
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
    maintenances,
    mutations,
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
                        className="h-[350px] w-full"
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
                description="Jumlah aktivitas maintenance aset berdasarkan rentang tanggal."
                activities={maintenances}
                config={maintenanceChartConfig}
                gradientId="fillMaintenance"
                strokeColor="var(--chart-2)"
            />

            <ActivityChart
                title="Mutasi"
                description="Jumlah aktivitas mutasi aset berdasarkan rentang tanggal."
                activities={mutations}
                config={mutationChartConfig}
                gradientId="fillMutation"
                strokeColor="var(--chart-3)"
            />
        </div>
    );
}

export { DashboardCharts };
