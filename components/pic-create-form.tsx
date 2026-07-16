"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";

import { createPic } from "@/actions/pic";
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
import type { CreatePicInput, CreatePicResponse } from "@/schemas/pic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function PicCreateForm() {
    const [state, action, pending] = useActionState(
        async (_: CreatePicResponse | null, payload: CreatePicInput) => {
            const result = await createPic(payload);

            return result;
        },
        null
    );

    const router = useRouter();

    const form = useForm<CreatePicInput>({
        defaultValues: {
            name: "",
            whatsappNumber: "",
            nip: "",
            email: "",
            suratKeputusan: "",
        },
    });
    const formId = useId();

    function onSubmit(data: CreatePicInput) {
        startTransition(() => {
            action(data);
        });
    }

    useEffect(() => {
        if (!state) return;

        if (!state.success) {
            console.log(state);
            if (state?.errors) {
                applyFormErrors(form, state.errors);
            } else {
                toast.error(
                    state?.message || "Terjadi kesalahan saat membuat PIC."
                );
            }
        }

        if (state.success) {
            router.push(`/pic/${state.data?.id}`);
        }
    }, [state, form, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Tambah PIC</h3>
                </CardTitle>
                <CardDescription>
                    Isi form di bawah ini untuk menambahkan PIC baru. Pastikan
                    semua informasi yang dimasukkan sudah benar sebelum
                    mengirimkan form.
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
                                        Nama PIC
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan nama PIC"
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
                            name="whatsappNumber"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Nomor WhatsApp
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan nomor WhatsApp"
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
                            name="nip"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        NIP
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan NIP"
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
                            name="email"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Email address
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan Email"
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
                            name="suratKeputusan"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Surat Keputusan
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan Surat Keputusan"
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

export { PicCreateForm };
