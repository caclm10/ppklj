"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateDeviceCategory } from "@/actions/device-category";
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
import { applyFormErrors } from "@/lib/utils";
import type {
    UpdateDeviceCategoryInput,
    UpdateDeviceCategoryResponse,
} from "@/schemas/device-category";

interface DeviceCategoryEditFormProps {
    id: string;
    initialData: UpdateDeviceCategoryInput;
}

function DeviceCategoryEditForm({ id, initialData }: DeviceCategoryEditFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: UpdateDeviceCategoryResponse | null,
            payload: UpdateDeviceCategoryInput
        ) => {
            return await updateDeviceCategory(id, payload);
        },
        null
    );

    const form = useForm<UpdateDeviceCategoryInput>({
        defaultValues: initialData,
    });
    const formId = useId();

    function onSubmit(data: UpdateDeviceCategoryInput) {
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
                        "Terjadi kesalahan saat memperbarui kategori."
                );
            }
        }

        if (state.success) {
            toast.success("Kategori berhasil diperbarui");
            router.push(`/devices/categories/${id}`);
            router.refresh();
        }
    }, [state, form, router, id]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Edit Kategori Perangkat</h3>
                </CardTitle>
                <CardDescription>
                    Perbarui nama kategori perangkat di bawah ini.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Nama Kategori
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan nama kategori"
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

export { DeviceCategoryEditForm };
