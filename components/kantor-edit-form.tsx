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

import { updateOffice } from "@/actions/office";
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
import type { UpdateOfficeInput, UpdateOfficeResponse } from "@/schemas/office";

interface KantorEditFormProps {
    id: string;
    initialData: UpdateOfficeInput;
    pics: RecordModel[];
}

function KantorEditForm({ id, initialData, pics }: KantorEditFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (_: UpdateOfficeResponse | null, payload: UpdateOfficeInput) => {
            const result = await updateOffice(id, payload);
            return result;
        },
        null
    );

    const form = useForm<UpdateOfficeInput>({
        defaultValues: initialData,
    });
    const formId = useId();

    function onSubmit(data: UpdateOfficeInput) {
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
                        "Terjadi kesalahan saat memperbarui kantor."
                );
            }
        }

        if (state.success) {
            toast.success("Kantor berhasil diperbarui");
            router.push(`/kantor/${id}`);
            router.refresh();
        }
    }, [state, form, router, id]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Edit Kantor</h3>
                </CardTitle>
                <CardDescription>
                    Perbarui informasi kantor di bawah ini. Pastikan semua
                    informasi yang dimasukkan sudah benar sebelum menyimpan.
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
                                    Belum ada PIC terdaftar.
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
                    Simpan Perubahan
                </Button>
            </CardFooter>
        </Card>
    );
}

export { KantorEditForm };
