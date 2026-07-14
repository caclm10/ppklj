type FormErrors<T> = {
    [K in keyof T]?: string[];
};

interface ActionResponse<T> {
    success: boolean;
    message?: string;
    errors?: T;
}

export type { FormErrors, ActionResponse };
