"use client"

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useUserStore } from '../../../store/userStore'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar";
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from '../../../store/sidebarStore'
import OperatorInitiation from '@/components/dialog/operator-initiation'
import { decrypt } from '@/lib/crypto'
import { Label } from '@/components/ui/label';

export default function AppLayout({ children }: { children: ReactNode }) {
    const { toggle } = useSidebarStore();
    const { name, user_id } = useUserStore()
    const isInitialized = useRef<boolean>(false)
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState<boolean>(false)
    const [role, setRole] = useState<string>("")


    useEffect(() => {
        const storageRole = localStorage.getItem("role")

        if (!storageRole) return
        const decryptedRole = decrypt(JSON.parse(storageRole))

        setRole(decryptedRole)

        setMounted(true)
        if (isInitialized.current) return
        isInitialized.current = true
    }, [user_id])

    if (!mounted) return null

    const isDark = resolvedTheme === 'dark'

    return (
        <div className="flex min-h-screen">
            {
                !role ?
                    <div className='flex items-center justify-center w-full h-full'>
                        Loading...
                    </div>
                    :
                    <>
                        {role === "Operator" && <OperatorInitiation />}
                        <SidebarProvider>
                            <AppSidebar role={role} />
                            <main className="flex-1 p-4">
                                <div className="flex justify-between">
                                    <SidebarTrigger onClick={toggle} />
                                    <Label>User Login : {name}</Label>
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
                    </>
            }
        </div>
    )
}
