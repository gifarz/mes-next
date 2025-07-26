"use client"

import React, { ReactNode } from 'react'
import { useUserStore } from '../../../store/userStore'
import { decodeJWT } from '@/lib/decodeJWT'
import { getCookie } from '@/lib/cookie'

export default function AppLayout({ children }: { children: ReactNode }) {
    const setUser = useUserStore((state) => state.setUser)
    const isInitialized = React.useRef(false)

    React.useEffect(() => {
        if (isInitialized.current) return
        isInitialized.current = true

        const token = getCookie("accessToken")

        if (token) {
            const init = async () => {
                try {
                    const decoded = decodeJWT(token)
                    setUser({ email: decoded.email, role: decoded.role })
                } catch (err) {
                    console.error("Invalid token", err)
                }
            }

            init()
        }
    }, [setUser])

    return <>{children}</>
}
