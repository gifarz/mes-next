"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from '../../../../../store/userStore'
import ProductDataTable from "../table"
import { formattedDate } from "@/lib/dateUtils"
import AddEditProduct from "../add-edit"
import { Product } from "../../../../../types/setup/product"

export default function ProductCard() {
    const [listProduct, setListProduct] = useState<Product[]>([])
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const [isFetched, setIsFetched] = useState<boolean>(false)

    const email = useUserStore((state) => state.email)

    useEffect(() => {
        const payload = {
            email: email,
        }

        const getProductByEmail = async () => {
            const res = await fetch("/api/getter/getProductByEmail", {
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

        getProductByEmail()

    }, [email, openDialog, refreshKey])

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
                            Product Management
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder="Search product..."
                            />
                            <Button
                                className="cursor-pointer"
                                onClick={() => setOpenDialog(true)}
                            >
                                Add Product
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
