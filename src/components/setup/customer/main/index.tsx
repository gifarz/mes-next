"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from '../../../../../store/userStore'
import AddEditCustomer from "../add-edit"
import CustomerDataTable from "../table"
import { formattedDate } from "@/lib/dateUtils"
import { Customer } from "../../../../../types/setup/customer"
import { useI18n } from "@/components/i18n/provider"

export default function CustomerCard() {
    const [listCustomer, setListCustomer] = useState<Customer[]>([])
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const [isFetched, setIsFetched] = useState<boolean>(false)

    const user_id = useUserStore((state) => state.user_id)
    const { t } = useI18n();

    useEffect(() => {
        const payload = { user_id }

        const fetcher = async () => {
            const res = await fetch("/api/getter/getCustomerByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataCustomers = await res.json()

            const fixedResponse = Array.isArray(dataCustomers?.data)
                ? dataCustomers.data.map((res: Customer) => ({
                    ...res,
                    created_on: formattedDate(res.created_on),
                }))
                : []

            setListCustomer(fixedResponse)
            setIsFetched(true)
        }

        fetcher()

    }, [user_id, openDialog, refreshKey])

    return (
        <>
            <Toaster position="top-right" />
            <AddEditCustomer
                isEdit={false}
                open={openDialog}
                onOpenChange={setOpenDialog}
            />

            <div className="flex flex-col min-h-screen gap-4">
                <div className="w-full max-h-full rounded">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            {t("customerManagement")}
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder={t("searchCustomer")}
                            />
                            <Button
                                className="cursor-pointer"
                                onClick={() => setOpenDialog(true)}
                            >
                                {t("addCustomer")}
                            </Button>
                        </div>
                    </div>
                </div>

                <CustomerDataTable
                    data={listCustomer}
                    onCustomerUpdated={() => setRefreshKey((prev) => prev + 1)} // 👈 Refetch trigger
                />
            </div>
        </>
    )
}
