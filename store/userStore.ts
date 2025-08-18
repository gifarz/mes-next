import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Factory } from "../types/setup/factory";

const encrypt = (data: string): string => btoa(data);
const decrypt = (data: string): string => atob(data);

interface UserState {
    user_id?: string | null;
    name?: string | null;
    role?: string | null;
    shift?: string | null;
    line?: string | null;
    station_id?: string | null;
    leader?: string | null;
    foreman?: string | null;
    factory: Factory[];
    setUser: (user: {
        user_id?: string;
        name?: string;
        role?: string;
        factory: Factory[];
    }) => void;
    setOperator: (operator: {
        shift?: string;
        line?: string;
        station_id?: string;
        leader?: string;
        foreman?: string;
    }) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user_id: null,
            name: null,
            role: null,
            shift: null,
            line: null,
            station_id: null,
            leader: null,
            foreman: null,
            factory: [],
            setUser: ({ user_id, name, role, factory }) =>
                set({ user_id, name, role, factory }),
            setOperator: ({ shift, line, station_id, leader, foreman }) =>
                set({ shift, line, station_id, leader, foreman }),
            clearUser: () =>
                set({ user_id: null, name: null, role: null, factory: [] }),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => ({
                getItem: (name) => {
                    const data = sessionStorage.getItem(name);
                    if (!data) return null;
                    try {
                        return JSON.parse(decrypt(data)); // 🔑 decrypt + parse
                    } catch {
                        return null;
                    }
                },
                setItem: (name, value) => {
                    sessionStorage.setItem(name, encrypt(JSON.stringify(value))); // 🔑 stringify + encrypt
                },
                removeItem: (name) => sessionStorage.removeItem(name),
            })),
        }
    )
);
