'use client'

import { useEffect, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '../../../../types/plan/order'
import { Station } from '../../../../types/setup/station'
import { Toaster } from '@/components/ui/sonner'
import ProductionScheduling from '../tables/production-scheduling'
import OrderTable from '../tables/order'
import { useSidebarStore } from '../../../../store/sidebarStore'
import { Product } from '../../../../types/setup/product'
import { Customer } from '../../../../types/setup/customer'
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/components/i18n/provider';


export default function SchedulingCard() {
    const [listOrders, setListOrders] = useState<Order[]>([]);
    const [listProducts, setListProducts] = useState<Product[]>([]);
    const [listCustomers, setListCustomers] = useState<Customer[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const { t } = useI18n();

    const { open } = useSidebarStore();

    useEffect(() => {
        const payload = { status: "Waiting" }

        const fetcher = async () => {
            try {
                const res = await fetch("/api/getter/getOrderByStatus", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                const json = await res.json()
                const orders = Array.isArray(json.data) ? json.data : []
                setListOrders(orders)

                // const stations = await fetch("/api/getter/getAllStations", {
                //     method: "GET"
                // });
                // const dataStations = await stations.json()

                // const fixedResponse = Array.isArray(dataStations?.data)
                //     ? dataStations.data
                //     : []

                // setListStations(fixedResponse)

                const resCustomer = await fetch("/api/getter/getAllCustomers", {
                    method: "GET"
                });

                const dataCustomer = await resCustomer.json()
                const fixedCustomer = Array.isArray(dataCustomer?.data)
                    ? dataCustomer.data : []

                setListCustomers(fixedCustomer)

                const resProduct = await fetch("/api/getter/getAllProducts", {
                    method: "GET"
                });

                const dataProduct = await resProduct.json()
                const fixedProduct = Array.isArray(dataProduct?.data)
                    ? dataProduct.data : []

                setListProducts(fixedProduct)

            } catch {
                setListOrders([])
            }
        }

        fetcher()

    }, [refreshKey, open, selectedRows, isSubmitted])

    const handleApplySchedule = async () => {
        setIsSubmitted(true)
        const res = await fetch("/api/patcher/updateStatusOrderByIdentifier", {
            method: "POST",
            body: JSON.stringify({
                identifier: selectedRows,
                status: "Scheduled"
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success(t("scheduled"))
        } else {
            toast.error(t("noRowSelected"))
        }

        setIsSubmitted(false)
    }

    return (
        <div>
            <Toaster position="top-right" />

            <OrderTable
                listOrders={listOrders}
                listProducts={listProducts}
                listCustomers={listCustomers}
                onOrderUpdated={() => setRefreshKey((prev) => prev + 1)} />

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <h2 className="text-2xl font-semibold mb-4 text-center">{t("schedulingTitle")}</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='flex justify-end gap-4'>
                        <Button
                            className='cursor-pointer'
                            variant="destructive"
                            onClick={handleApplySchedule}
                        >
                            {
                                isSubmitted ?
                                    <>
                                        <Spinner />
                                        <span className="ml-0">{t("submitting")}</span>
                                    </>
                                    :
                                    t("applySchedule")
                            }
                        </Button>
                    </div>
                    <ProductionScheduling
                        listData={listOrders}
                        isSidebarOpen={open}
                        onSelectedRows={setSelectedRows}
                    />
                </CardContent>
            </Card>
        </div>
    )
}