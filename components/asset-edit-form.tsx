"use client";

import { startTransition, useActionState, useEffect, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RecordModel } from "pocketbase";
import { NumericFormat } from "react-number-format";

import { updateAsset } from "@/actions/asset";
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
import { Textarea } from "@/components/ui/textarea";
import { OfficeRoomPickerDialog } from "@/components/office-room-picker-dialog";
import { applyFormErrors } from "@/lib/utils";
import { assetStatusValues } from "@/schemas/asset";
import type { UpdateAssetInput, UpdateAssetResponse } from "@/schemas/asset";

interface AssetEditFormProps {
    id: string;
    initialData: UpdateAssetInput;
    models: RecordModel[];
    offices: RecordModel[];
    rooms: RecordModel[];
}

function AssetEditForm({
    id,
    initialData,
    models,
    offices,
    rooms,
}: AssetEditFormProps) {
    const router = useRouter();
    const [state, action, pending] = useActionState(
        async (_: UpdateAssetResponse | null, payload: UpdateAssetInput) => {
            return await updateAsset(id, payload);
        },
        null
    );

    const form = useForm<UpdateAssetInput>({
        defaultValues: initialData,
    });
    const formId = useId();
    const roomId = useWatch({ control: form.control, name: "roomId" });

    function onSubmit(data: UpdateAssetInput) {
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
                    state?.message || "Terjadi kesalahan saat memperbarui aset."
                );
            }
        }

        if (state.success) {
            toast.success("Aset berhasil diperbarui");
            router.push(`/assets/${id}`);
            router.refresh();
        }
    }, [state, form, router, id]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h3>Form Edit Aset</h3>
                </CardTitle>
                <CardDescription>
                    Perbarui informasi aset perangkat di bawah ini.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="deviceModelId"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Model Perangkat
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
                                            <SelectValue placeholder="Pilih model">
                                                {(() => {
                                                    const selected =
                                                        models.find(
                                                            (m) =>
                                                                m.id ===
                                                                field.value
                                                        );
                                                    return selected
                                                        ? `${selected.vendor} ${selected.model}`
                                                        : undefined;
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {models.map((model) => (
                                                <SelectItem
                                                    key={model.id}
                                                    value={model.id}
                                                >
                                                    {model.vendor} {model.model}
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
                            name="serialNumber"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Serial Number
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan serial number"
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
                            name="hostname"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Hostname
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Masukkan hostname"
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

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="ipAddress"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            IP Address
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Masukkan IP address"
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
                                name="macAddress"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            MAC Address
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Masukkan MAC address"
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
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="firmware"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Firmware
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Contoh: v2.4.1"
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
                                name="status"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Status
                                        </FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id={field.name}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                className="w-full"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assetStatusValues.map(
                                                    (status) => (
                                                        <SelectItem
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </SelectItem>
                                                    )
                                                )}
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
                                name="tahunPembelian"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Tahun Pembelian
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Contoh: 2023"
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
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="supportUntil"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Support Sampai
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="date"
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
                                name="warrantyUntil"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Garansi Sampai
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="date"
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
                        </div>

                        <Controller
                            control={form.control}
                            name="harga"
                            render={({
                                field: { onChange, ...field },
                                fieldState,
                            }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Harga (opsional)
                                    </FieldLabel>
                                    <NumericFormat
                                        customInput={Input}
                                        {...field}
                                        getInputRef={field.ref}
                                        id={field.name}
                                        placeholder="Masukkan harga aset"
                                        aria-invalid={fieldState.invalid}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="Rp "
                                        allowNegative={false}
                                        onValueChange={(values) => {
                                            onChange(`${values.floatValue}`);
                                        }}
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
                            name="officeId"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        Kantor & Ruangan (opsional)
                                    </FieldLabel>
                                    <OfficeRoomPickerDialog
                                        offices={offices}
                                        rooms={rooms}
                                        officeId={field.value}
                                        roomId={roomId}
                                        onChange={(values) => {
                                            field.onChange(values.officeId);
                                            form.setValue(
                                                "roomId",
                                                values.roomId
                                            );
                                        }}
                                    />
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        Catatan
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        placeholder="Catatan tambahan (opsional)"
                                        rows={4}
                                    />
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

export { AssetEditForm };
