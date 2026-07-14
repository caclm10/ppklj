import { clsx, type ClassValue } from "clsx";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

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

export { cn, applyFormErrors };
