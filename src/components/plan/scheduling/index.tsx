'use client'

import { useEffect, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '../../../../types/plan/order'
import { useUserStore } from '../../../../store/userStore'
import GanttChart from '../chart/GanttTaskReactWrapper'
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


export default function SchedulingCard() {
    const [listOrders, setListOrders] = useState<Order[]>([]);
    const [listStations, setListStations] = useState<Station[]>([]);
    const [listProducts, setListProducts] = useState<Product[]>([]);
    const [listCustomers, setListCustomers] = useState<Customer[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

    const email = useUserStore((state) => state.email)
    const { open } = useSidebarStore();

    useEffect(() => {
        const payload = { email, status: "Waiting" }

        const fetcher = async () => {
            try {
                const res = await fetch("/api/getter/getOrderByEmailStatus", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                const json = await res.json()
                const orders = Array.isArray(json.data) ? json.data : []
                setListOrders(orders)

                const payloadStation = {
                    email: email
                }
                const stations = await fetch("/api/getter/getStationsByEmail", {
                    method: "POST",
                    body: JSON.stringify(payloadStation),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const dataStations = await stations.json()

                const fixedResponse = Array.isArray(dataStations?.data)
                    ? dataStations.data
                    : []

                setListStations(fixedResponse)

                const resCustomer = await fetch("/api/getter/getCustomerByEmail", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const dataCustomer = await resCustomer.json()
                const fixedCustomer = Array.isArray(dataCustomer?.data)
                    ? dataCustomer.data : []

                setListCustomers(fixedCustomer)

                const resProduct = await fetch("/api/getter/getProductByEmail", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const dataProduct = await resProduct.json()
                const fixedProduct = Array.isArray(dataProduct?.data)
                    ? dataProduct.data : []

                setListProducts(fixedProduct)

            } catch (error) {
                console.error("Failed to fetch orders:", error)
                setListOrders([])
            }
        }

        if (email) fetcher()

    }, [email, refreshKey, open, selectedRows, isSubmitted])

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

        const json = await res.json()
        console.log('json response', json)

        if (res.ok) {
            toast.success("The Selected Rows Has Been Scheduled! Please Check On The Track Page")
        } else {
            toast.error(json.message)
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
                        <h2 className="text-2xl font-semibold mb-4 text-center">Production Scheduling Table</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='flex justify-between gap-4'>
                        <Select value={selectedStation} onValueChange={setSelectedStation}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select the station" />
                            </SelectTrigger>
                            <SelectContent>
                                {listStations.length === 0 ?
                                    <p className="p-2 text-sm text-gray-500">No station available</p>
                                    :
                                    listStations.map((station) => (
                                        <SelectItem
                                            value={station.name}
                                            key={station.identifier}
                                        >
                                            {station.name}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        <Button
                            variant="destructive"
                            onClick={handleApplySchedule}
                        >
                            {
                                isSubmitted ?
                                    <>
                                        <Spinner className="border-white dark:border-black" />
                                        <span className="ml-0">Submitting</span>
                                    </>
                                    :
                                    "Apply Schedule"
                            }
                        </Button>
                    </div>
                    <ProductionScheduling
                        listData={listOrders}
                        selectedStation={selectedStation}
                        isSidebarOpen={open}
                        onSelectedRows={setSelectedRows}
                    />
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>
                        <h2 className="text-2xl font-semibold mb-4 text-center">Scheduling Chart</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <GanttChart isSidebarOpen={open} />
                </CardContent>
            </Card>
        </div>
    )
}