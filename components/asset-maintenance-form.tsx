"use client";

import {
    startTransition,
    useActionState,
    useEffect,
    useId,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createMaintenance } from "@/actions/maintenance";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyFormErrors } from "@/lib/utils";
import { assetStatusValues } from "@/schemas/asset";
import {
    type CreateMaintenanceInput,
    type CreateMaintenanceResponse,
} from "@/schemas/maintenance";

interface AssetMaintenanceFormProps {
    assetId: string;
    currentStatus: string;
    currentFirmware: string;
    onSuccess?: () => void;
}

function AssetMaintenanceForm({
    assetId,
    currentStatus,
    currentFirmware,
    onSuccess,
}: AssetMaintenanceFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: CreateMaintenanceResponse | null,
            payload: CreateMaintenanceInput
        ) => {
            return await createMaintenance(payload);
        },
        null
    );

    const form = useForm<CreateMaintenanceInput, object, CreateMaintenanceInput>({
        defaultValues: {
            assetId,
            date: new Date().toISOString().slice(0, 10),
            description: "",
            performedBy: "",
            updateStatus: false,
            newStatus: (currentStatus as "baik" | "rusak" | "rusak berat") || "baik",
            updateFirmware: false,
            newFirmware: currentFirmware || "",
        },
    });
    const formId = useId();

    useEffect(() => {
        if (!state) return;

        if (!state.success) {
            if (state?.errors) {
                applyFormErrors(form, state.errors);
            } else {
                toast.error(
                    state?.message || "Terjadi kesalahan saat mencatat maintenance."
                );
            }
        }

        if (state.success) {
            toast.success("Maintenance berhasil dicatat");
            form.reset();
            router.refresh();
            onSuccess?.();
        }
    }, [state, form, onSuccess, router]);

    function onSubmit(data: CreateMaintenanceInput) {
        startTransition(() => {
            action(data);
        });
    }

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <input type="hidden" {...form.register("assetId")} />

                <Controller
                    control={form.control}
                    name="date"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Tanggal Maintenance
                            </FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                type="date"
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="performedBy"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Pelaksana (opsional)
                            </FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                placeholder="Nama teknisi/pelaksana"
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <div className="rounded-lg border p-4">
                    <span className="mb-3 block text-sm font-medium">
                        Perubahan pada Aset
                    </span>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <Controller
                                control={form.control}
                                name="updateStatus"
                                render={({ field }) => (
                                    <Checkbox
                                        id="updateStatus"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <div className="grid flex-1 gap-2">
                                <FieldLabel htmlFor="updateStatus">
                                    Update Status
                                </FieldLabel>
                                <Controller
                                    control={form.control}
                                    name="newStatus"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assetStatusValues.map(
                                                    (status: string) => (
                                                        <SelectItem
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Controller
                                control={form.control}
                                name="updateFirmware"
                                render={({ field }) => (
                                    <Checkbox
                                        id="updateFirmware"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <div className="grid flex-1 gap-2">
                                <FieldLabel htmlFor="updateFirmware">
                                    Update Firmware
                                </FieldLabel>
                                <Controller
                                    control={form.control}
                                    name="newFirmware"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Contoh: v2.4.1"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor={field.name}>
                                Catatan Maintenance (opsional)
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id={field.name}
                                placeholder="Jelaskan detail maintenance"
                                rows={4}
                            />
                        </Field>
                    )}
                />
            </FieldGroup>

            <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={pending}>
                    Simpan Maintenance
                </Button>
            </div>
        </form>
    );
}

export { AssetMaintenanceForm };
