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

export { cn, applyFormErrors, getBadgeVariantByStatus };
