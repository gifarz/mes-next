"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useUserStore } from '../../../../store/userStore';
import { InfoRow } from '@/components/ui/info-row';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Order } from '../../../../types/plan/order';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from '@/components/ui/sonner';
import { compareBetweenDate, customizeDateString } from '@/lib/dateUtils';
import DeleteConfirmation from '@/components/dialog/delete-confirmation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { decrypt } from '@/lib/crypto';
import { Station } from '../../../../types/setup/station';
import { useI18n } from '@/components/i18n/provider';

export default function ListOrdersCard() {
    const [listOrders, setListOrders] = useState<Order[]>([])
    const [listLines, setListLines] = useState<Station[]>([])
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [identifier, setIdentifier] = useState<string>("")
    const [orderNumber, setOrderNumber] = useState<string>("")
    const [defect, setDefect] = useState<number>(0)
    const [done, setDone] = useState<number>(0)

    const [role, setRole] = useState<string>("")
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [openUpdate, setOpenUpdate] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [buttonId, setButtonId] = useState<Set<string>>(new Set());
    const [selectedLine, setSelectedLine] = useState<string>("")
    const [stationId, setStationId] = useState<string>("")
    const { t } = useI18n();

    const { user_id, name, shift, line, station_id, leader, foreman } = useUserStore()

    useEffect(() => {
        const payload = {
            station_id: station_id ? station_id : stationId
        }
        const storageRole = localStorage.getItem("role")

        if (!storageRole) return
        const decryptedRole = decrypt(JSON.parse(storageRole))

        setRole(decryptedRole)

        const fetcher = async () => {
            const responseOrder = await fetch("/api/getter/getOrderByStationIdStatus", {
                method: "POST",
                body: JSON.stringify({
                    ...payload,
                    not_status: "Waiting",
                    not_status_2: "Done",
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const dataOrder = await responseOrder.json()
            const fixedOrder = Array.isArray(dataOrder.data) ? dataOrder.data : []
            setListOrders(fixedOrder)

            const responseLine = await fetch("/api/getter/getAllStations", {
                method: "GET"
            })

            const dataLine = await responseLine.json()
            const fixedLine = Array.isArray(dataLine.data) ? dataLine.data : []
            setListLines(fixedLine)
        }

        fetcher()

    }, [station_id, isSubmitted, refreshKey, foreman, leader, line, name, shift, stationId])

    const handleReceiveJob = async (id: string, order_number: string) => {
        setButtonId(prev => new Set(prev).add(id));

        try {
            const actualStart = customizeDateString("yyyy-MM-dd HH:mm:ss")
            const res = await fetch("/api/patcher/updateStatusOrderByIdentifier", {
                method: "POST",
                body: JSON.stringify({
                    identifier: [id],
                    status: "Work In Progress",
                    actual_start: actualStart,
                    receiver: user_id,
                    shift: shift || "not_operator"
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
        console.log('total_items', total_items)
        console.log('quantity', quantity)

        if (total_items <= Number(quantity)) {
            const actual_end = customizeDateString("yyyy-MM-dd HH:mm:ss")
            const payload = {
                identifier,
                defect,
                done,
                completed: `${completed}%`,
                actual_end: completed === 100 ? actual_end : null,
                duration: completed === 100 ? compareBetweenDate(actual_start, actual_end) : null,
                status: completed === 100 ? "Done" : "Work In Progress",
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

            setDefect(0)
            setDone(0)

        } else {
            toast.error("The total items is not match with quantity")
            setDefect(0)
            setDone(0)
        }

        setIsSubmitted(false)
    }

    return (
        <div>
            <Toaster position="top-right" />
            <DeleteConfirmation
                title='Order Delete'
                description={`Are you sure want to delete Order Number : ${orderNumber} ? this can be reverse`}
                open={openDialog}
                onOpenChange={setOpenDialog}
                onClickYes={() => handleDelete(identifier)}
            />
            {
                role === "Operator" ?
                    <div className="grid grid-cols-3 gap-4">
                        {/* Name */}
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="name">Operator</Label>
                            <Input id="name" disabled value={name ? name : "-"} />
                        </div>

                        {/* Line */}
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="line">Line</Label>
                            <Input id="line" disabled value={line ? line : "-"} />
                        </div>

                        {/* Shift */}
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="shift">Shift</Label>
                            <Input id="shift" disabled value={shift ? shift : "-"} />
                        </div>

                        {/* Leader + Foreman in same row, centered */}
                        <div className="col-span-3 flex justify-center gap-6">
                            {/* Leader */}
                            <div className="flex flex-col space-y-2 w-1/3">
                                <Label htmlFor="leader">Leader</Label>
                                <Input id="leader" disabled value={leader ? leader : "-"} />
                            </div>

                            {/* Foreman */}
                            <div className="flex flex-col space-y-2 w-1/3">
                                <Label htmlFor="foreman">Foreman</Label>
                                <Input id="foreman" disabled value={foreman ? foreman : "-"} />
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <Select
                            value={selectedLine}
                            onValueChange={(name) => {
                                if (name === "all") {
                                    setStationId("all")
                                    setSelectedLine("all")
                                } else {
                                    const selectedLine = listLines.find(l => l.name === name);

                                    if (selectedLine) {
                                        setStationId(selectedLine.identifier)
                                        setSelectedLine(selectedLine.name)
                                    }
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("selectStation")} />
                            </SelectTrigger>
                            <SelectContent>
                                {listLines.length === 0 ?
                                    <p className="p-2 text-sm text-gray-500">{t("noData")}</p>
                                    :
                                    <>
                                        <SelectItem value="all">{t("allStation")}</SelectItem>
                                        {
                                            listLines.map((station) => (
                                                <SelectItem
                                                    value={station.name}
                                                    key={station.identifier}
                                                >
                                                    {station.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </>
                                }
                            </SelectContent>
                        </Select>
                    </div>
            }

            {
                listOrders.length === 0 ?
                    <div className="col-span-full text-center mt-10 text-muted-foreground">
                        {t("noData")}
                    </div>
                    :
                    <div className='grid md:grid-cols-2 gap-4 mt-5'>
                        {
                            listOrders.map((order) => (
                                <Card className='relative max-h-[500px]' key={order.identifier}>
                                    <CardHeader className="absolute top-0 left-0 rounded-t-xl z-10 bg-card w-full flex items-center justify-between min-h-[70px] px-5">
                                        <h2 className="text-2xl font-semibold text-center">
                                            {t("product_code")} : {order.product_code}
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
                                            <InfoRow label={t("orderNumber")} value={order.order_number} />
                                            <InfoRow label={t("customerName")} value={order.customer_name} />
                                            <InfoRow label={t("productName")} value={order.product_name} />
                                            <InfoRow label={t("productCode")} value={order.product_code} />
                                            <InfoRow label={t("part_name")} value={order.part_name} />
                                            <InfoRow label={t("quantity")} value={order.quantity} />
                                            {/* <InfoRow label="Estimate Start" value={order.estimate_start} />
                                            <InfoRow label="Estimate End" value={order.estimate_end} /> */}
                                            <InfoRow
                                                label={t("actual_start")}
                                                value={order.actual_start ? order.actual_start : "N/A"}
                                            />
                                            <InfoRow
                                                label={t("actual_end")}
                                                value={order.actual_end ? order.actual_end : "N/A"}
                                            />
                                            <InfoRow
                                                label={t("duration")}
                                                value={order.duration ? order.duration : "N/A"}
                                            />
                                            <InfoRow
                                                label={t("defect")}
                                                value={
                                                    order.defect_item ?
                                                        `${order.defect_item}/${order.quantity}`
                                                        : "N/A"
                                                }
                                            />
                                            <InfoRow
                                                label={t("done")}
                                                value={
                                                    order.done_item ?
                                                        `${order.done_item}/${order.quantity}`
                                                        : "N/A"
                                                }
                                            />
                                            <InfoRow
                                                label={t("completed")}
                                                value={order.completed ? order.completed : "N/A"}
                                            />
                                            <InfoRow
                                                label={t("status")}
                                                value={order.status}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="absolute bottom-0 left-0 rounded-b-xl z-10 bg-card w-full flex items-center justify-between min-h-[70px] px-5">
                                        <div className="w-full flex gap-4 pr-2">
                                            {/* RECEIVE JOB button */}
                                            <Button
                                                disabled={
                                                    order.status == "Work In Progress" ||
                                                    order.status == "Done" ||
                                                    buttonId.has(order.identifier)
                                                }
                                                className="w-1/2 cursor-pointer"
                                                onClick={() => handleReceiveJob(order.identifier, order.order_number)}
                                            >
                                                {buttonId.has(order.identifier) ? (
                                                    <>
                                                        <Spinner />
                                                        <span className="ml-0">{t("submitting")}</span>
                                                    </>
                                                ) : (
                                                    t("receiveJob").toUpperCase()
                                                )}
                                            </Button>

                                            {/* PROGRESS REPORT dialog, scoped to this card only */}
                                            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
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
                                                        {t("progressReport").toUpperCase()}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader className="mb-4">
                                                        <DialogTitle>{t("progressUpdate")}</DialogTitle>
                                                        <DialogDescription>
                                                            {t("totalItemEqualQuantity")} ({order.quantity})
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-2">
                                                        <div>
                                                            <label>{t("defected")}</label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={order.quantity}
                                                                defaultValue={order.defect_item}
                                                                onChange={(e) => setDefect(Number(e.target.value))}
                                                                placeholder={t("defectedPlaceholder")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label>{t("done")}</label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={order.quantity}
                                                                defaultValue={order.done_item}
                                                                onChange={(e) => setDone(Number(e.target.value))}
                                                                placeholder={t("donePlaceholder")}
                                                            />
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button className="cursor-pointer" variant="outline">
                                                                {t("cancel").toUpperCase()}
                                                            </Button>
                                                        </DialogClose>
                                                        <Button
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                            onClick={async () => {
                                                                await handleUpdateProgress(
                                                                    order.identifier,
                                                                    order.quantity,
                                                                    order.actual_start,
                                                                    order.product_name,
                                                                    order.created_by
                                                                )
                                                                setOpenUpdate(false)
                                                            }}
                                                        >
                                                            {isSubmitted ? (
                                                                <>
                                                                    <Spinner />
                                                                    <span className="ml-0">{t("submitting")}</span>
                                                                </>
                                                            ) : (
                                                                t("updateProgress").toUpperCase()
                                                            )}
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
