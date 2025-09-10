"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { useUserStore } from '../../../../../store/userStore'
import InventoryDataTable from "../table"
import { formattedDate } from "@/lib/dateUtils"
import AddEditInventory from "../add-edit"
import { useI18n } from "@/components/i18n/provider"

interface Inventory {
    identifier: string
    factory_id: string
    name: string
    code: string
    cost: string
    quantity: string
    created_on: string
}

export default function InventoryCard() {
    const [listInventory, setListInventory] = useState<Inventory[]>([])
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const [isFetched, setIsFetched] = useState<boolean>(false)

    const user_id = useUserStore((state) => state.user_id)
    const { t } = useI18n();

    useEffect(() => {
        const payload = {
            user_id: user_id,
        }

        const fetcher = async () => {
            const res = await fetch("/api/getter/getInventoryByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataInventory = await res.json()

            const fixedResponse = Array.isArray(dataInventory?.data)
                ? dataInventory.data.map((res: Inventory) => ({
                    ...res,
                    created_on: formattedDate(res.created_on),
                }))
                : []

            setListInventory(fixedResponse)
            setIsFetched(true)
        }

        fetcher()

    }, [user_id, openDialog, refreshKey])

    return (
        <>
            <Toaster position="top-right" />
            <AddEditInventory
                isEdit={false}
                open={openDialog}
                onOpenChange={setOpenDialog}
            />

            <div className="flex flex-col min-h-screen gap-4">
                <div className="w-full max-h-full rounded">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            {t("inventoryManagement")}
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder={t("searchInventory")}
                            />
                            <Button
                                className="cursor-pointer"
                                onClick={() => setOpenDialog(true)}
                            >
                                {t("addInventory")}
                            </Button>
                        </div>
                    </div>
                </div>

                <InventoryDataTable
                    data={listInventory}
                    onInventoryUpdated={() => setRefreshKey((prev) => prev + 1)} // 👈 Refetch trigger
                />
            </div>
        </>
    )
}
