"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useUserStore } from '../../../../store/userStore';
import { InfoRow } from '@/components/ui/info-row';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Station } from '../../../../types/setup/station';
import { Order } from '../../../../types/plan/order';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from '@/components/ui/sonner';
import { compareBetweenDate, customizeDateString, formattedDate } from '@/lib/dateUtils';
import DialogComponent from '@/components/dialog';
import { Input } from '@/components/ui/input';

export default function ProductionCard() {
    const [listStations, setListStations] = useState<Station[]>([])
    const [listOrders, setListOrders] = useState<Order[]>([])
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [selectedStation, setSelectedStation] = useState<string>("")
    const [identifier, setIdentifier] = useState<string>("")
    const [orderNumber, setOrderNumber] = useState<string>("")
    const [defect, setDefect] = useState<number>(0)
    const [done, setDone] = useState<number>(0)

    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [openDialogProgress, setOpenDialogProgress] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [buttonId, setButtonId] = useState<Set<string>>(new Set());

    const email = useUserStore((state) => state.email)
    useEffect(() => {
        const payload = { email }

        const fetcher = async () => {
            const res = await fetch("/api/getter/getOrderByEmailStatus", {
                method: "POST",
                body: JSON.stringify({
                    ...payload,
                    not_status: "Waiting",
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const json = await res.json()
            const orders = Array.isArray(json.data) ? json.data : []
            setListOrders(orders)

            const stations = await fetch("/api/getter/getStationsByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const dataStations = await stations.json()

            const fixedResponse = Array.isArray(dataStations?.data)
                ? dataStations.data
                : []

            setListStations(fixedResponse)
        }

        fetcher()

    }, [email, isSubmitted, refreshKey])

    const handleReceiveJob = async (id: string, order_number: string) => {
        setButtonId(prev => new Set(prev).add(id));

        try {
            const actualStart = customizeDateString("yyyy-MM-dd HH:mm:ss")
            const res = await fetch("/api/patcher/updateStatusOrderByIdentifier", {
                method: "POST",
                body: JSON.stringify({
                    identifier: [id],
                    status: "Work In Progress",
                    actual_start: actualStart
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const json = await res.json()

            if (res.ok) {
                toast.success(`Order Number ${order_number} Switched to Work In Progress`)
            } else {
                toast.error(json.message)
            }

        } finally {
            setButtonId(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }

        setRefreshKey((prev) => prev + 1)

    }

    const handleDelete = async (id: string) => {
        const res = await fetch("/api/remover/deleteOrderByIdentifier", {
            method: "POST",
            body: JSON.stringify({
                identifier: id
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const json = await res.json()

        if (res.ok) {
            toast.success(json.message)
        } else {
            toast.error(json.message)
        }

        setOpenDialog(false)
        setRefreshKey(prev => prev + 1)
    }

    const handleUpdateProgress = async (
        identifier: string, quantity: string, actual_start: string, product_name: string, created_by: string
    ) => {
        setIsSubmitted(true)
        const total_items = Number(defect) + Number(done)
        const completed = (Number(done) / Number(quantity)) * 100

        if (total_items <= Number(quantity)) {
            const actual_end = customizeDateString("yyyy-MM-dd HH:mm:ss")
            const payload = {
                identifier,
                defect,
                done,
                completed: `${completed}%`,
                actual_end: completed === 100 ? actual_end : null,
                duration: completed === 100 ? compareBetweenDate(actual_start, actual_end) : null,
                status: completed === 100 ? "Done" : "Work In Progress"
            }

            const res = await fetch("/api/patcher/updateProgressOrderByIdentifier", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const json = await res.json()

            if (res.ok) {
                toast.success(`Order Completed Updated to ${completed}%`)

                if (completed === 100) {
                    const payload = {
                        product_name,
                        quantity,
                        created_by
                    }
                    const res = await fetch("/api/patcher/updateQuantityInventoryByName", {
                        method: "POST",
                        body: JSON.stringify(payload),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (res.ok) {
                        toast.success("Order Has Been Done!")
                    }
                }

            } else {
                toast.error(json.message)
            }

            setOpenDialogProgress(false)

        } else {
            toast.error("The total items is not match with quantity")
        }

        setIsSubmitted(false)
    }

    return (
        <div>
            <Toaster position="top-right" />
            <DialogComponent
                title='Order Delete'
                description={`Are you sure want to delete Order Number : ${orderNumber} ? this can be reverse`}
                open={openDialog}
                onOpenChange={setOpenDialog}
                onClickYes={() => handleDelete(identifier)}
            />

            <h2 className="text-2xl font-semibold mb-6 text-center">
                Work in Progress Job Tracking
            </h2>
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

            {
                listOrders.length === 0 ?
                    <div className="col-span-full text-center mt-10 text-muted-foreground">
                        No Station Active of Production Found.
                    </div>
                    :
                    <div className='grid md:grid-cols-2 gap-4 mt-5'>
                        {
                            listOrders.map((order) => (
                                <Card className='relative max-h-[500px]' key={order.identifier}>
                                    <CardHeader className="absolute top-0 left-0 rounded-t-xl z-10 bg-card w-full flex items-center justify-between min-h-[70px] px-5">
                                        <h2 className="text-2xl font-semibold text-center">
                                            Part : {order.product_part}
                                        </h2>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="top-[-10px] right-[-10px] cursor-pointer"
                                            onClick={() => {
                                                setOpenDialog(true)
                                                setIdentifier(order.identifier)
                                                setOrderNumber(order.order_number)
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-[50px] pb-[50px] overflow-y-auto">
                                        <div className="divide-y">
                                            <InfoRow label="Order Number" value={order.order_number} />
                                            <InfoRow label="Customer Name" value={order.customer_name} />
                                            <InfoRow label="Production Name" value={order.product_name} />
                                            <InfoRow label="SKU Code" value={order.product_sku} />
                                            <InfoRow label="Product Part" value={order.product_part} />
                                            <InfoRow label="Quantity" value={order.quantity} />
                                            <InfoRow label="Estimate Start" value={order.estimate_start} />
                                            <InfoRow label="Estimate End" value={order.estimate_end} />
                                            <InfoRow
                                                label="Actual Start"
                                                value={order.actual_start ? order.actual_start : "N/A"}
                                            />
                                            <InfoRow
                                                label="Actual End"
                                                value={order.actual_end ? order.actual_end : "N/A"}
                                            />
                                            <InfoRow
                                                label="Duration"
                                                value={order.duration ? order.duration : "N/A"}
                                            />
                                            <InfoRow
                                                label="Defect"
                                                value={
                                                    order.defect_item ?
                                                        `${order.defect_item}/${order.quantity}`
                                                        : "N/A"
                                                }
                                            />
                                            <InfoRow
                                                label="Done"
                                                value={
                                                    order.done_item ?
                                                        `${order.done_item}/${order.quantity}`
                                                        : "N/A"
                                                }
                                            />
                                            <InfoRow
                                                label="Completed"
                                                value={order.completed ? order.completed : "N/A"}
                                            />
                                            <InfoRow
                                                label="Status"
                                                value={order.status}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="absolute bottom-0 left-0 rounded-b-xl z-10 bg-card w-full flex items-center justify-between min-h-[70px] px-5">
                                        <div className='w-full flex gap-4 pr-2'>
                                            <Button
                                                disabled={
                                                    order.status == "Work In Progress" ||
                                                    order.status == "Done" ||
                                                    buttonId.has(order.identifier)
                                                }
                                                className='w-1/2 cursor-pointer'
                                                onClick={() => handleReceiveJob(order.identifier, order.order_number)}
                                            >
                                                {
                                                    buttonId.has(order.identifier) ?
                                                        <>
                                                            <Spinner />
                                                            <span className="ml-0">Submitting</span>
                                                        </>
                                                        :
                                                        "RECEIVE JOB"
                                                }
                                            </Button>
                                            <Dialog open={openDialogProgress} onOpenChange={setOpenDialogProgress}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        disabled={
                                                            order.status == "Waiting" ||
                                                            order.status == "Done" ||
                                                            order.status == "Scheduled"
                                                        }
                                                        variant="destructive"
                                                        className="w-1/2 cursor-pointer"
                                                    >
                                                        PROGRESS REPORT
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader className='mb-4'>
                                                        <DialogTitle>Progress Update</DialogTitle>
                                                        <DialogDescription>
                                                            The total item should be equal with quantity ({order.quantity})
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className='space-y-2'>
                                                        <div>
                                                            <label>Defected</label>
                                                            <Input
                                                                type='number'
                                                                min={0}
                                                                max={order.quantity}
                                                                defaultValue={order.defect_item}
                                                                onChange={(e) => setDefect(Number(e.target.value))}
                                                                placeholder="Enter Defected Items"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label>Done</label>
                                                            <Input
                                                                type='number'
                                                                min={0}
                                                                max={order.quantity}
                                                                defaultValue={order.done_item}
                                                                onChange={(e) => setDone(Number(e.target.value))}
                                                                placeholder="Enter Done Items"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button className="cursor-pointer" variant="outline">CANCEL</Button>
                                                        </DialogClose>
                                                        <Button
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                            onClick={() => handleUpdateProgress(order.identifier, order.quantity, order.actual_start, order.product_name, order.created_by)}
                                                        >
                                                            {
                                                                isSubmitted ?
                                                                    <>
                                                                        <Spinner />
                                                                        <span className="ml-0">Submitting</span>
                                                                    </>
                                                                    :
                                                                    "UPDATE PROGRESS"
                                                            }
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        }
                    </div>
            }
        </div>
    )
}
