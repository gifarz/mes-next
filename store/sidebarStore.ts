// store/sidebarStore.ts
import { create } from "zustand";

type SidebarState = {
    open: boolean;
    toggle: () => void;
    setOpen: (value: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
    open: true,
    toggle: () => set((state) => ({ open: !state.open })),
    setOpen: (value) => set({ open: value }),
}));
