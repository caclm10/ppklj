"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RecordModel } from "pocketbase";

import { updateDeviceModel } from "@/actions/device-model";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { applyFormErrors } from "@/lib/utils";
import type {
    UpdateDeviceModelInput,
    UpdateDeviceModelResponse,
} from "@/schemas/device-model";

interface DeviceModelEditFormProps {
    id: string;
    initialData: UpdateDeviceModelInput;
    categories: RecordModel[];
}

function DeviceModelEditForm({
    id,
    initialData,
    categories,
}: DeviceModelEditFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: UpdateDeviceModelResponse | null,
            payload: UpdateDeviceModelInput
        ) => {
            return await updateDeviceModel(id, payload);
        },
        null
    );

    const form = useForm<UpdateDeviceModelInput>({
        defaultValues: initialData,
    });
    const formId = useId();

    function onSubmit(data: UpdateDeviceModelInput) {
        startTransition(() => {
            action(data);
        });
    }

    useEffect(() => {
        if (!state) return;

        if (!state.success) {
            if (state?.errors) {
                applyFormErrors(form, state.errors);
            } else {
                toast.error(
                    state?.message ||
                        "Terjadi kesalahan saat memperbarui model perangkat."
                );
            }
        }

        if (state.success) {
            toast.success("Model perangkat berhasil diperbarui");
            router.push(`/devices/${id}`);
            router.refresh();
        }
    }, [state, form, router, id]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Edit Model Perangkat</h3>
                </CardTitle>
                <CardDescription>
                    Perbarui kategori, vendor, dan model perangkat.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="deviceCategoryId"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Kategori
                                    </FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih kategori">
                                                {
                                                    categories.find(
                                                        (c) =>
                                                            c.id === field.value
                                                    )?.name
                                                }
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="vendor"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Vendor
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan vendor"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="model"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Model
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan model"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="justify-end">
                <Button type="submit" form={formId} disabled={pending}>
                    Simpan Perubahan
                </Button>
            </CardFooter>
        </Card>
    );
}

export { DeviceModelEditForm };
