"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from '../../../../../store/userStore'
import InventoryDataTable from "../table"
import { formattedDate } from "@/lib/dateUtils"
import AddEditInventory from "../add-edit"

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

    const email = useUserStore((state) => state.email)

    useEffect(() => {
        const payload = {
            email: email,
        }

        const getInventoryByEmail = async () => {
            const res = await fetch("/api/getter/getInventoryByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const response = await res.json()

            const fixedResponse = response.data.map((res: Inventory) => {
                return {
                    ...res,
                    created_on: formattedDate(res.created_on)
                }
            })

            setListInventory(fixedResponse)
            setIsFetched(true)
        }

        getInventoryByEmail()

    }, [email, openDialog, refreshKey])

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
                            Inventory Management
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder="Search inventory..."
                            />
                            <Button
                                className="cursor-pointer"
                                onClick={() => setOpenDialog(true)}
                            >
                                Add Inventory
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
