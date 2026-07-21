"use client";

import {
    startTransition,
    useActionState,
    useEffect,
    useId,
    useMemo,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyFormErrors } from "@/lib/utils";
import type {
    CreateMutationInput,
    CreateMutationResponse,
} from "@/schemas/mutation";

interface AssetMutationFormProps {
    assetId: string;
    offices: RecordModel[];
    rooms: RecordModel[];
    onSuccess?: () => void;
}

function AssetMutationForm({
    assetId,
    offices,
    rooms,
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

    const toOfficeId = useWatch({ control: form.control, name: "toOfficeId" });
    const availableRooms = useMemo(() => {
        return toOfficeId
            ? rooms.filter((room) => room.office_id?.includes(toOfficeId))
            : [];
    }, [toOfficeId, rooms]);

    useEffect(() => {
        const currentRoomId = form.getValues("toRoomId");
        if (
            currentRoomId &&
            !availableRooms.some((room) => room.id === currentRoomId)
        ) {
            form.setValue("toRoomId", "");
        }
    }, [availableRooms, form]);

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

                <Controller
                    control={form.control}
                    name="toOfficeId"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Kantor Tujuan
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
                                    <SelectValue placeholder="Pilih kantor tujuan">
                                        {
                                            offices.find(
                                                (o) => o.id === field.value
                                            )?.nama
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {offices.map((office) => (
                                        <SelectItem
                                            key={office.id}
                                            value={office.id}
                                        >
                                            {office.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="toRoomId"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor={field.name}>
                                Ruangan Tujuan (opsional)
                            </FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!toOfficeId}
                            >
                                <SelectTrigger
                                    id={field.name}
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder={
                                            toOfficeId
                                                ? "Pilih ruangan"
                                                : "Pilih kantor terlebih dahulu"
                                        }
                                    >
                                        {(() => {
                                            const selected = availableRooms.find(
                                                (r) => r.id === field.value
                                            );
                                            return selected
                                                ? `${selected.name} (lantai ${selected.floor})`
                                                : undefined;
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tidak ada</SelectItem>
                                    {availableRooms.map((room) => (
                                        <SelectItem
                                            key={room.id}
                                            value={room.id}
                                        >
                                            {room.name} (lantai {room.floor})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                />

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
