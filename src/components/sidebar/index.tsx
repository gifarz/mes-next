"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import {
    Button
} from "@/components/ui/button"
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

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/app/dashboard",
        icon: Home,
    },
    {
        title: "Setup",
        url: "/app/setup",
        icon: Inbox,
    },
    {
        title: "Plan",
        url: "/app/plan",
        icon: Calendar,
    },
    {
        title: "Track",
        url: "/app/track",
        icon: Search,
    },
    {
        title: "Settings",
        url: "/app/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="flex justify-center">
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="mt-10">
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className={`h-12 ${isActive ? "bg-muted font-semibold" : ""}`}
                                    >
                                        <SidebarMenuButton asChild className="h-full flex items-center gap-2 px-4">
                                            <Link href={item.url}>
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.title}</span>
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
                <Button className="w-full cursor-pointer">LOGOUT</Button>
            </SidebarFooter>
        </Sidebar>
    )
}