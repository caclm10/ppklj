"use client";

import {
    ChevronsUpDownIcon,
    LogOutIcon,
    NetworkIcon,
    UserCircleIcon,
    UsersRoundIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, use } from "react";
import { toast } from "sonner";

import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

const menu = {
    items: [
        {
            title: "PIC",
            url: "/pic",
            icon: UsersRoundIcon,
        },
    ],
};

function AppSidebar() {
    return (
        <Sidebar variant="inset">
            <AppSidebarHeader />

            <SidebarContent>
                <AppSidebarMainMenu />
            </SidebarContent>

            <SidebarFooter>
                <Suspense
                    fallback={
                        <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
                    }
                >
                    <AppSidebarUserButton />
                </Suspense>
            </SidebarFooter>
        </Sidebar>
    );
}

function AppSidebarHeader() {
    return (
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <NetworkIcon className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">PPKLJ</span>
                            <span className="truncate text-xs">
                                Monitoring Perangkat
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    );
}

function AppSidebarMainMenu() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarMenu>
                {menu.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                            size="lg"
                            isActive={pathname.startsWith(item.url)}
                            render={<Link href={item.url} />}
                        >
                            <item.icon />
                            <span className="">{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function AppSidebarUserButton() {
    const { getCurrentUserPromise } = useAuth();
    const user = use(getCurrentUserPromise);

    const isMobile = useIsMobile();
    const router = useRouter();

    async function handleLogout() {
        const toastId = toast.loading("Logging out...");

        const result = await logout();
        toast.dismiss(toastId);

        if (!result.success) {
            toast.error(
                result.message || "Terjadi kesalahan di internal server."
            );
            return;
        }

        router.push("/login");
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            />
                        }
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="rounded-lg">
                                {user?.name?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {user?.name}
                            </span>
                            <span className="truncate text-xs">
                                {user?.email}
                            </span>
                        </div>
                        <ChevronsUpDownIcon className="ml-auto size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={user?.avatar}
                                            alt={user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <UserCircleIcon />
                                Account
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export { AppSidebar };
