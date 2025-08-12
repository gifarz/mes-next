import { create } from "zustand"
import { Factory } from "../types/setup/factory"

interface UserState {
    email?: string | null
    role?: string | null
    factory: Factory[]
    setUser: (user: { email?: string; role?: string, factory: Factory[] }) => void
    clearUser: () => void
}

interface FactoryState {
    factory: Factory[]
    setUser: (user: { factory: Factory[] }) => void
}

export const useUserStore = create<UserState>((set) => ({
    email: null,
    role: null,
    factory: [],
    setUser: ({ email, role, factory }) => set({ email, role, factory }),
    clearUser: () => set({ email: null, role: null, factory: [] }),
}))
