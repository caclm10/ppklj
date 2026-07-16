import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
    title: string;
    backTo?: string;
    action?: React.ReactNode;
}

function DashboardHeader({ title, backTo, action }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-2">
            {backTo && (
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={backTo} />}
                    >
                        <ChevronLeftIcon />
                        Kembali
                    </Button>
                </div>
            )}

            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{title}</h1>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}

export { DashboardHeader };
