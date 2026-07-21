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
import type { RecordModel } from "pocketbase";

import { createOffice } from "@/actions/office";
import { PicPickerDialog } from "@/components/pic-picker-dialog";
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
import type { CreateOfficeInput, CreateOfficeResponse } from "@/schemas/office";

interface KantorCreateFormProps {
    pics: RecordModel[];
}

function KantorCreateForm({ pics }: KantorCreateFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (_: CreateOfficeResponse | null, payload: CreateOfficeInput) => {
            const result = await createOffice(payload);
            return result;
        },
        null
    );

    const form = useForm<CreateOfficeInput>({
        defaultValues: {
            nama: "",
            kode: "",
            pic: [],
        },
    });
    const formId = useId();

    function onSubmit(data: CreateOfficeInput) {
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
                    state?.message || "Terjadi kesalahan saat membuat kantor."
                );
            }
        }

        if (state.success) {
            toast.success("Kantor berhasil ditambahkan");
            router.push(`/kantor/${state.data?.id}`);
        }
    }, [state, form, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Tambah Kantor</h3>
                </CardTitle>
                <CardDescription>
                    Isi form di bawah ini untuk menambahkan kantor baru ke dalam
                    sistem.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="nama"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Nama Kantor
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan nama kantor"
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
                            name="kode"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Kode Kantor
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan kode kantor"
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

                        <Field>
                            <FieldLabel>Pilih PIC Terkait</FieldLabel>
                            {pics.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">
                                    Belum ada PIC terdaftar. Tambahkan PIC
                                    terlebih dahulu.
                                </p>
                            ) : (
                                <Controller
                                    control={form.control}
                                    name="pic"
                                    render={({ field }) => (
                                        <PicPickerDialog
                                            pics={pics}
                                            selectedIds={field.value || []}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            )}
                        </Field>
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

export { KantorCreateForm };
