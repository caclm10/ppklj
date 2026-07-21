"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RecordModel } from "pocketbase";

import { createDeviceModel } from "@/actions/device-model";
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
    CreateDeviceModelInput,
    CreateDeviceModelResponse,
} from "@/schemas/device-model";

interface DeviceModelCreateFormProps {
    categories: RecordModel[];
}

function DeviceModelCreateForm({ categories }: DeviceModelCreateFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: CreateDeviceModelResponse | null,
            payload: CreateDeviceModelInput
        ) => {
            return await createDeviceModel(payload);
        },
        null
    );

    const form = useForm<CreateDeviceModelInput>({
        defaultValues: {
            deviceCategoryId: "",
            vendor: "",
            model: "",
        },
    });
    const formId = useId();

    function onSubmit(data: CreateDeviceModelInput) {
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
                        "Terjadi kesalahan saat membuat model perangkat."
                );
            }
        }

        if (state.success) {
            toast.success("Model perangkat berhasil ditambahkan");
            router.push(`/devices/${state.data?.id}`);
        }
    }, [state, form, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Tambah Model Perangkat</h3>
                </CardTitle>
                <CardDescription>
                    Pilih kategori, lalu isi vendor dan model perangkat.
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
                    Submit
                </Button>
            </CardFooter>
        </Card>
    );
}

export { DeviceModelCreateForm };
