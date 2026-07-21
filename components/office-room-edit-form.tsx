"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateOfficeRoom } from "@/actions/office-room";
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
    UpdateOfficeRoomInput,
    UpdateOfficeRoomResponse,
} from "@/schemas/office-room";

interface OfficeRoomEditFormProps {
    roomId: string;
    officeId: string;
    initialData: UpdateOfficeRoomInput;
}

function OfficeRoomEditForm({
    roomId,
    officeId,
    initialData,
}: OfficeRoomEditFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: UpdateOfficeRoomResponse | null,
            payload: UpdateOfficeRoomInput
        ) => {
            return await updateOfficeRoom(roomId, payload);
        },
        null
    );

    const form = useForm<UpdateOfficeRoomInput>({
        defaultValues: initialData,
    });
    const formId = useId();

    function onSubmit(data: UpdateOfficeRoomInput) {
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
                        "Terjadi kesalahan saat memperbarui ruangan."
                );
            }
        }

        if (state.success) {
            toast.success("Ruangan berhasil diperbarui");
            router.push(`/kantor/${officeId}/rooms/${roomId}`);
            router.refresh();
        }
    }, [state, form, router, officeId, roomId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Edit Ruangan</h3>
                </CardTitle>
                <CardDescription>
                    Perbarui informasi ruangan di bawah ini.
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
                                        Nama Ruangan
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan nama ruangan"
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
                            name="floor"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Lantai
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan lantai"
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
                            name="code"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Kode Ruangan
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan kode ruangan (opsional)"
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

export { OfficeRoomEditForm };
