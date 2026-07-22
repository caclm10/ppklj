import { clsx, type ClassValue } from "clsx";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import type { AssetStatus } from "@/types/data";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function applyFormErrors<T extends FieldValues>(
    form: UseFormReturn<T>,
    errors: Record<string, string[]>
) {
    Object.entries(errors).forEach(([key, value]) => {
        form.setError(key as Path<T>, {
            type: "manual",
            message: value?.[0] ?? "",
        });
    });
}

function getBadgeVariantByStatus(status: AssetStatus) {
    if (status === "baik") return "success";
    if (status === "rusak") return "warning";

    return "destructive";
}

function isApproachingDate(
    dateStr: string | undefined | null,
    yearsBefore: number
): boolean {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return false;

    const threshold = new Date(target);
    threshold.setFullYear(threshold.getFullYear() - yearsBefore);

    const now = new Date();
    return now >= threshold && now <= target;
}

function isExpired(dateStr: string | undefined | null): boolean {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return false;
    return new Date() > target;
}

export {
    cn,
    applyFormErrors,
    getBadgeVariantByStatus,
    isApproachingDate,
    isExpired,
};
