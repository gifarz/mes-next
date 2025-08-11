import { create } from "zustand"
import { persist } from 'zustand/middleware'

interface Factory {
    name: string | null
    type: string | null
    production_model: string | null
    operation_start: string | null
    operation_end: string | null
    overtime_start: string | null
    overtime_end: string | null
    operation_day: string | null
    productivity_optimization: string | null
    work_utilization: string | null
    standard_machine_efficiency: string | null
    acceptable_waste: string | null
    reschedule_interval: string | null
}

interface UserState {
    email: string | null
    role: string | null
    factory: Factory[]
    setUser: (user: { email: string; role: string, factory: Factory[] }) => void
    clearUser: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            email: null,
            role: null,
            factory: [],
            setUser: (user) => set(() => ({
                email: user.email,
                role: user.role,
                factory: user.factory,
            })),
            clearUser: () =>
                set(() => ({
                    email: null,
                    role: null,
                    factory: [],
                })),
        }),
        {
            name: 'user-store', // key in localStorage
        }
    )
)