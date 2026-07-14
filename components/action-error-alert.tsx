import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ActionErrorAlertProps {
    title?: string;
    description?: string;
}

function ActionErrorAlert({
    title = "Action Failed",
    description,
}: ActionErrorAlertProps) {
    return (
        <Alert variant="destructive" className="max-w-md">
            <AlertCircleIcon />
            <AlertTitle>{title}</AlertTitle>
            {description && <AlertDescription>{description}</AlertDescription>}
        </Alert>
    );
}

export { ActionErrorAlert };
