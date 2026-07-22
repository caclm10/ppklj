"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecordModel } from "pocketbase";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DashboardWarningCardProps {
    title: string;
    description: string;
    assets: RecordModel[];
    dateField: "support_until" | "warranty_until";
    warningYears: number;
    emptyMessage: string;
}

function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isApproaching(
    dateStr: string | undefined | null,
    yearsBefore: number
): boolean {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return false;

    const threshold = new Date(target);
    threshold.setFullYear(threshold.getFullYear() - yearsBefore);

    const now = new Date();
    return now >= threshold;
}

function DashboardWarningCard({
    title,
    description,
    assets,
    dateField,
    warningYears,
    emptyMessage,
}: DashboardWarningCardProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredAssets = assets.filter((asset) =>
        isApproaching(asset[dateField], warningYears)
    );

    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const pagedAssets = filteredAssets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                {filteredAssets.length === 0 ? (
                    <p className="px-6 text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hostname</TableHead>
                                    <TableHead>Serial Number</TableHead>
                                    <TableHead className="whitespace-nowrap">
                                        Tanggal Berakhir
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagedAssets.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/assets/${asset.id}`}>
                                                {asset.hostname}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {asset.serial_number}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(asset[dateField])}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {totalPages > 1 && (
                            <div className="flex justify-center px-6">
                                <Pagination className="mx-0 w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                text="Prev"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage((p) =>
                                                        Math.max(1, p - 1)
                                                    );
                                                }}
                                                className={
                                                    currentPage <= 1
                                                        ? "pointer-events-none opacity-50"
                                                        : ""
                                                }
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }).map(
                                            (_, i) => {
                                                const pageNum = i + 1;
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    Math.abs(
                                                        pageNum - currentPage
                                                    ) <= 1
                                                ) {
                                                    return (
                                                        <PaginationItem
                                                            key={pageNum}
                                                        >
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={
                                                                    pageNum ===
                                                                    currentPage
                                                                }
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    setCurrentPage(
                                                                        pageNum
                                                                    );
                                                                }}
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }
                                                if (
                                                    pageNum === 2 ||
                                                    pageNum === totalPages - 1
                                                ) {
                                                    return (
                                                        <PaginationItem
                                                            key={pageNum}
                                                        >
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }
                                                return null;
                                            }
                                        )}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                text="Next"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage((p) =>
                                                        Math.min(
                                                            totalPages,
                                                            p + 1
                                                        )
                                                    );
                                                }}
                                                className={
                                                    currentPage >= totalPages
                                                        ? "pointer-events-none opacity-50"
                                                        : ""
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export { DashboardWarningCard };
