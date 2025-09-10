"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import { useMemo } from "react"
import { useI18n } from '@/components/i18n/provider';

// Menu items
const items = [
    { title: "Dashboard", url: "/app/dashboard", icon: Home },
    { title: "Setup", url: "/app/setup", icon: Inbox },
    { title: "Plan", url: "/app/plan", icon: Calendar },
    { title: "Track", url: "/app/track", icon: Search },
    { title: "Settings", url: "/app/settings", icon: Settings },
]

export function AppSidebar({ role }: { role: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const { t, locale, setLocale } = useI18n();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push("/auth")
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    // Filter menu items based on role
    const filteredItems = useMemo(() => {
        if (role === "Operator") {
            return items.filter(
                (item) => item.title === "Track" || item.title === "Settings"
            )
        }
        return items
    }, [role])

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="flex flex-col text-center my-8">
                        <h1 className="font-bold">IMES-PLATFORM</h1>
                        <Image
                            src="/logo.png"
                            alt="Centered Logo"
                            width={95}
                            height={95}
                            className="mt-2"
                        />
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="mt-28">
                        <Select
                            value={locale}
                            onValueChange={setLocale}
                        >
                            <SelectTrigger className="w-full mb-4">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="id">Bahasa</SelectItem>
                                <SelectItem value="ja">日本語</SelectItem>
                            </SelectContent>
                        </Select>
                        <SidebarMenu>
                            {filteredItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className={`h-12 ${isActive ? "bg-muted font-semibold" : ""
                                            }`}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            className="h-full flex items-center gap-2 px-4"
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="w-5 h-5" />
                                                <span>{t(item.title.toLowerCase())}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full cursor-pointer">
                            {t("logout").toUpperCase()}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t("logout")}</DialogTitle>
                            <DialogDescription>
                                {t("confirm")}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button className="cursor-pointer" variant="outline">
                                    {t("no")}
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={handleLogout}
                            >
                                {t("yes")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarFooter>
        </Sidebar>
    )
}
