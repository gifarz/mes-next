"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { useUserStore } from '../../../../../store/userStore'
import ProductDataTable from "../table"
import { formattedDate } from "@/lib/dateUtils"
import AddEditProduct from "../add-edit"
import { Product } from "../../../../../types/setup/product"
import { useI18n } from "@/components/i18n/provider"

export default function ProductCard() {
    const [listProduct, setListProduct] = useState<Product[]>([])
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
            const res = await fetch("/api/getter/getProductByUserId", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const response = await res.json()

            const fixedResponse = Array.isArray(response?.data)
                ? response.data.map((res: Product) => {
                    return {
                        ...res,
                        created_on: formattedDate(res.created_on)
                    }
                })
                : []

            setListProduct(fixedResponse)
            setIsFetched(true)
        }

        fetcher()

    }, [user_id, openDialog, refreshKey])

    return (
        <>
            <Toaster position="top-right" />
            <AddEditProduct
                isEdit={false}
                open={openDialog}
                onOpenChange={setOpenDialog}
            />
            <div className="flex flex-col min-h-screen gap-4 w-full">
                <div className="w-full max-h-full rounded">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            {t("productManagement")}
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder={t("searchProduct")}
                            />
                            <Button
                                className="cursor-pointer"
                                onClick={() => setOpenDialog(true)}
                            >
                                {t("addProduct")}
                            </Button>
                        </div>
                    </div>
                </div>

                <ProductDataTable
                    data={listProduct}
                    onProductUpdated={() => setRefreshKey((prev) => prev + 1)} // 👈 Refetch trigger
                />
            </div>
        </>
    )
}
