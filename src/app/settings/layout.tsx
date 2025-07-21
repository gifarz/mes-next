import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ReactNode } from 'react'
import { AppSidebar } from "@/components/sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 p-4">
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}
