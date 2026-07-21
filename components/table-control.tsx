"use client";

import { useTransition, startTransition, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

interface TableControlProps {
    searchPlaceholder: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export function TableControl({
    searchPlaceholder,
    currentPage,
    totalPages,
    totalItems,
}: TableControlProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    function updateParams(key: string, value: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key === "search") {
            params.delete("page"); // Reset ke halaman 1 jika query pencarian berubah
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
                <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        updateParams("search", e.target.value || null);
                    }}
                    className="h-9 pl-9 text-sm"
                />
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="hidden text-xs text-muted-foreground lg:block">
                        Menampilkan halaman <strong>{currentPage}</strong> dari{" "}
                        <strong>{totalPages}</strong> ({totalItems} total data)
                    </span>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    text="Prev"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1 && !pending) {
                                            updateParams(
                                                "page",
                                                String(currentPage - 1)
                                            );
                                        }
                                    }}
                                    className={
                                        currentPage <= 1
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                // Tampilkan halaman pertama, halaman terakhir, dan halaman di sekitar halaman aktif
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    Math.abs(pageNum - currentPage) <= 1
                                ) {
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                isActive={
                                                    pageNum === currentPage
                                                }
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (!pending) {
                                                        updateParams(
                                                            "page",
                                                            String(pageNum)
                                                        );
                                                    }
                                                }}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                // Render ellipsis
                                if (
                                    pageNum === 2 ||
                                    pageNum === totalPages - 1
                                ) {
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    text="Next"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (
                                            currentPage < totalPages &&
                                            !pending
                                        ) {
                                            updateParams(
                                                "page",
                                                String(currentPage + 1)
                                            );
                                        }
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
    );
}
