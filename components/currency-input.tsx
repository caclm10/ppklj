"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    "aria-invalid"?: boolean;
}

function formatRupiah(value: string): string {
    const raw = value.replace(/\D/g, "");
    if (!raw) return "";
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState(formatRupiah(value));

    useEffect(() => {
        setDisplayValue(formatRupiah(value));
    }, [value]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const raw = event.target.value.replace(/\D/g, "");
        onChange(raw);
        setDisplayValue(formatRupiah(raw));
    }

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
        />
    );
}

export { CurrencyInput, formatRupiah };
