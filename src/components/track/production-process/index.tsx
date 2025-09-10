'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import { Order } from '../../../../types/plan/order'
import { useSidebarStore } from '../../../../store/sidebarStore'
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useI18n } from '@/components/i18n/provider'

type SortKey = keyof Order
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'order_number', label: 'ORDER_NUMBER' },
    { key: 'product_name', label: 'PRODUCT' },
    { key: 'product_code', label: 'CODE' },
    { key: 'part_name', label: 'PART' },
    { key: 'quantity', label: 'QUANTITY' },
    { key: 'total_length', label: 'TOTAL_LENGTH' },
    { key: 'stripping_front', label: 'STRIPPING_FRONT' },
    { key: 'stripping_rear', label: 'STRIPPING_REAR' },
    { key: 'actual_start', label: 'ACTUAL_START' },
    { key: 'actual_end', label: 'ACTUAL_END' },
    { key: 'status', label: 'STATUS' },
    { key: 'qc', label: 'QC' },
    { key: 'checker', label: 'CHECKER' },
    { key: 'action', label: 'ACTION' }
] as const

export default function WarehouseCard() {
    const [loading, setLoading] = useState<boolean>(false);
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [qc, setQc] = useState<string>("");
    const [checker, setChecker] = useState<string>("");
    const [dataOrder, setDataOrder] = useState<Order>();
    const [listOrders, setListOrders] = useState<Order[]>([]);
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'order_number', order: 'asc' },
    ])

    const { open } = useSidebarStore();
    const { t } = useI18n();

    useEffect(() => {
        const payload = { not_status: "Waiting" }

        const fetcher = async () => {
            const resCustomer = await fetch("/api/getter/getOrderByStatus", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const json = await resCustomer.json()
            const orders = Array.isArray(json.data) ? json.data : []
            setListOrders(orders)
        }

        fetcher()

    }, [isSubmitted])


    const sortedData = [...listOrders].sort((a, b) => {
        for (const rule of sortRules) {
            const valueA = a[rule.key]
            const valueB = b[rule.key]

            if (valueA === valueB) continue

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return rule.order === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA)
            }

            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return rule.order === 'asc' ? valueA - valueB : valueB - valueA
            }
        }
        return 0
    })

    const handleSort = (key: SortKey) => {
        setSortRules((prev) => {
            const existing = prev.find((rule) => rule.key === key)

            if (existing) {
                // Toggle the order
                return [
                    { key, order: existing.order === 'asc' ? 'desc' : 'asc' },
                    ...prev.filter((r) => r.key !== key),
                ]
            } else {
                // Add new rule to front
                return [{ key, order: 'asc' }, ...prev]
            }
        })
    }

    const SortIcon = ({ column }: { column: SortKey }) => {
        const rule = sortRules.find((r) => r.key === column)
        if (!rule) return null

        return rule.order === 'asc' ? (
            <ArrowUpIcon className="inline" />
        ) : (
            <ArrowDownIcon className="inline" />
        )
    }

    const handleEditOrder = async (data: Order) => {
        setIsSubmitted(true)
        const payload = {
            qc, checker, identifier: data.identifier
        }
        const res = await fetch("/api/patcher/updateQcCheckerByIdentifier", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (res.ok) {
            toast.success(`Order ${data.order_number} Has Been Updated!`)
            setOpenEdit(false)
        } else {
            toast.error(`Failed to Update Order ${data.order_number}`)
        }
        setIsSubmitted(false)
    }

    const handleDeleteOrder = async (data: Order) => {
        setIsSubmitted(true)
        const res = await fetch("/api/remover/deleteOrderByIdentifier", {
            method: "POST",
            body: JSON.stringify({ identifier: data.identifier }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (res.ok) {
            toast.success(`Order ${data.order_number} Has Been Deleted!`)
        } else {
            toast.error(`Failed to Delete Order ${data.order_number}`)
        }
        setIsSubmitted(false)
    }

    const handleExport = async () => {
        setLoading(true);

        // 1. Load the template from /public
        const response = await fetch("/template-spv.xlsx");
        const arrayBuffer = await response.arrayBuffer();

        // 2. Read the workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        // 3. Get the first sheet (adjust if needed)
        const worksheet = workbook.getWorksheet(1);

        // 4. Data to append (under the header row)
        const plainArray = listOrders.map(order => [
            order.station_name,
            order.shift,
            order.receiver,
            order.actual_start,
            order.actual_end,
            order.order_number,
            order.product_code,
            order.part_code,
            order.total_length,
            order.stripping_front,
            order.stripping_rear,
            order.quantity,
            order.completed,
            order.qc,
            order.checker
        ]);

        // 5. Append data starting from row 3
        worksheet?.addRows(plainArray);

        // 6. Export the updated workbook
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "List Order.xlsx");

        setLoading(false);
    };

    return (
        <div>
            <Toaster position="top-right" />

            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Edit Order</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                        <div>
                            <label>QC</label>
                            <Input
                                value={qc}
                                onChange={(e) => setQc(e.target.value)}
                                placeholder="Enter Defected Items"
                            />
                        </div>
                        <div>
                            <label>CHECKER</label>
                            <Input
                                value={checker}
                                onChange={(e) => setChecker(e.target.value)}
                                placeholder="Enter Done Items"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">CANCEL</Button>
                        </DialogClose>
                        <Button
                            className='cursor-pointer'
                            disabled={!qc || !checker || isSubmitted}
                            variant="destructive"
                            onClick={() => dataOrder && handleEditOrder(dataOrder)}
                        >
                            {isSubmitted ? (
                                <>
                                    <Spinner />
                                    <span className="ml-0">Submitting</span>
                                </>
                            ) : (
                                "UPDATE ORDER"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-end mt-5">
                <Button
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={handleExport}
                >
                    {
                        loading ?
                            t("downloading")
                            :
                            t("exportToExcel")
                    }
                </Button>
            </div>
            <div
                className="overflow-x-auto"
                style={{
                    width: open ? "calc(100vw - 340px)" : "calc(100vw - 140px)",
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(({ key }) => (
                                <TableHead key={key} className="text-center">
                                    {key === 'action' ? (
                                        <span className="font-semibold">{t(key)}</span>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort(key as SortKey)}
                                            className="font-semibold"
                                        >
                                            {t(key)}
                                            <SortIcon column={key as SortKey} />
                                        </Button>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            sortedData.length === 0 ?
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                                        {t("noData")}
                                    </TableCell>
                                </TableRow>
                                :
                                sortedData.map((data) => (
                                    <TableRow key={data.identifier} className="text-center">
                                        {columns.map(({ key }) => (
                                            <TableCell key={key}>
                                                {key === 'action' ? (
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 12h.01M12 12h.01M18 12h.01"
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setDataOrder(data)
                                                                        setOpenEdit(true)
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {t("edit").toUpperCase()}
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteOrder(data)}
                                                                    className="cursor-pointer text-red-600 focus:text-red-700"
                                                                >
                                                                    {t("delete").toUpperCase()}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                ) : (
                                                    data[key] || "-"
                                                )}
                                            </TableCell>

                                        ))}
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}