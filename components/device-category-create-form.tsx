"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createDeviceCategory } from "@/actions/device-category";
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
    CreateDeviceCategoryInput,
    CreateDeviceCategoryResponse,
} from "@/schemas/device-category";

function DeviceCategoryCreateForm() {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: CreateDeviceCategoryResponse | null,
            payload: CreateDeviceCategoryInput
        ) => {
            return await createDeviceCategory(payload);
        },
        null
    );

    const form = useForm<CreateDeviceCategoryInput>({
        defaultValues: {
            name: "",
        },
    });
    const formId = useId();

    function onSubmit(data: CreateDeviceCategoryInput) {
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
                        "Terjadi kesalahan saat membuat kategori."
                );
            }
        }

        if (state.success) {
            toast.success("Kategori berhasil ditambahkan");
            router.push(`/devices/categories/${state.data?.id}`);
        }
    }, [state, form, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Tambah Kategori Perangkat</h3>
                </CardTitle>
                <CardDescription>
                    Isi nama kategori perangkat di bawah ini.
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
                    Submit
                </Button>
            </CardFooter>
        </Card>
    );
}

export { DeviceCategoryCreateForm };
