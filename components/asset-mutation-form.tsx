"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { MapPinIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { toast } from "sonner";

import { createMutation } from "@/actions/mutation";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OfficeRoomPickerDialog } from "@/components/office-room-picker-dialog";
import { applyFormErrors } from "@/lib/utils";
import type {
    CreateMutationInput,
    CreateMutationResponse,
} from "@/schemas/mutation";

interface AssetMutationFormProps {
    assetId: string;
    offices: RecordModel[];
    rooms: RecordModel[];
    currentLocation: string;
    onSuccess?: () => void;
}

function AssetMutationForm({
    assetId,
    offices,
    rooms,
    currentLocation,
    onSuccess,
}: AssetMutationFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (
            _: CreateMutationResponse | null,
            payload: CreateMutationInput
        ) => {
            return await createMutation(payload);
        },
        null
    );

    const form = useForm<CreateMutationInput>({
        defaultValues: {
            assetId,
            date: new Date().toISOString().slice(0, 10),
            toOfficeId: "",
            toRoomId: "",
            notes: "",
        },
    });
    const formId = useId();

    const [toOfficeId, toRoomId] = useWatch({
        control: form.control,
        name: ["toOfficeId", "toRoomId"],
    });

    useEffect(() => {
        if (!state) return;

        if (!state.success) {
            if (state?.errors) {
                applyFormErrors(form, state.errors);
            } else {
                toast.error(
                    state?.message || "Terjadi kesalahan saat mencatat mutasi."
                );
            }
        }

        if (state.success) {
            toast.success("Mutasi berhasil dicatat");
            form.reset();
            router.refresh();
            onSuccess?.();
        }
    }, [state, form, onSuccess, router]);

    function onSubmit(data: CreateMutationInput) {
        startTransition(() => {
            action(data);
        });
    }

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <input type="hidden" {...form.register("assetId")} />

                <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Lokasi Saat Ini
                    </span>
                    <div className="flex items-center gap-2">
                        <MapPinIcon className="size-4 text-muted-foreground" />
                        <span>{currentLocation}</span>
                    </div>
                </div>

                <Controller
                    control={form.control}
                    name="date"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Tanggal Mutasi
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

                <Field>
                    <FieldLabel>Kantor & Ruangan Tujuan</FieldLabel>
                    <OfficeRoomPickerDialog
                        offices={offices}
                        rooms={rooms}
                        officeId={toOfficeId}
                        roomId={toRoomId}
                        onChange={({ officeId, roomId }) => {
                            form.setValue("toOfficeId", officeId, {
                                shouldValidate: true,
                            });
                            form.setValue("toRoomId", roomId, {
                                shouldValidate: true,
                            });
                        }}
                    />
                </Field>

                <Controller
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor={field.name}>
                                Catatan (opsional)
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id={field.name}
                                placeholder="Alasan mutasi, nomor surat, dsb."
                                rows={4}
                            />
                        </Field>
                    )}
                />
            </FieldGroup>

            <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={pending}>
                    Simpan Mutasi
                </Button>
            </div>
        </form>
    );
}

export { AssetMutationForm };
