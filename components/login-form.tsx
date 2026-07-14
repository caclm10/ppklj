"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { applyFormErrors, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
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
import { LoginFormData } from "@/schemas/auth";
import { login } from "@/actions/auth";
import type { ActionResponse, FormErrors } from "@/schemas/action";
import { ActionErrorAlert } from "@/components/action-error-alert";

function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const [state, action, pending] = useActionState(
        async (
            _: ActionResponse<FormErrors<LoginFormData>> | null,
            payload: LoginFormData
        ) => {
            return await login(payload);
        },
        null
    );

    const form = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmit(data: LoginFormData) {
        startTransition(() => {
            action(data);
        });
    }

    useEffect(() => {
        if (state?.errors) {
            applyFormErrors(form, state.errors);
        }
    }, [state]);

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h1>Login</h1>
                    </CardTitle>
                    <CardDescription>
                        Masukkan email dan password untuk masuk ke akun Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {state && !state.success && state.message && (
                        <div className="mb-4">
                            <ActionErrorAlert description={state.message} />
                        </div>
                    )}
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="email"
                                            placeholder="m@example.com"
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
                                name="password"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="password"
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
                                <Button type="submit" disabled={pending}>
                                    Login
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export { LoginForm };
