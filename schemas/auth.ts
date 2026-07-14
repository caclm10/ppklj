import * as z from "zod";

const loginSchema = z.object({
    email: z
        .email({ error: "Email tidak valid" })
        .min(1, { error: "Email tidak boleh kosong" }),
    password: z
        .string()
        .min(1, { error: "Password tidak boleh kosong" })
        .min(6, { error: "Password minimal 6 karakter" })
        .max(20, { error: "Password maksimal 20 karakter" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export type { LoginFormData };

export { loginSchema };
