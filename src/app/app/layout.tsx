"use client"

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useUserStore } from '../../../store/userStore'
import { decodeJWT } from '@/lib/decodeJWT'
import { getCookie } from '@/lib/cookie'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar";
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from '../../../store/sidebarStore'

export default function AppLayout({ children }: { children: ReactNode }) {
    const { toggle } = useSidebarStore();
    const isInitialized = useRef(false)
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isInitialized.current) return
        isInitialized.current = true
    }, [])

    if (!mounted) return null

    const isDark = resolvedTheme === 'dark'

    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 p-4">
                    <div className="flex justify-between">
                        <SidebarTrigger onClick={toggle} />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        >
                            {isDark ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </div>
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}
