// store/userStore.ts
import { create } from "zustand"

interface UserState {
    email: string | null
    role: string | null
    setUser: (user: { email: string; role: string }) => void
    clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
    email: null,
    role: null,
    setUser: ({ email, role }) => set({ email, role }),
    clearUser: () => set({ email: null, role: null }),
}))
