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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import { Order } from '../../../../types/plan/order'
import { useUserStore } from '../../../../store/userStore'
import { useSidebarStore } from '../../../../store/sidebarStore'

type SortKey = keyof Order
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'station_name', label: 'STATION' },
    { key: 'order_number', label: 'ORDER_NUMBER' },
    { key: 'customer_name', label: 'CUSTOMER' },
    { key: 'product_name', label: 'PRODUCT' },
    { key: 'product_part', label: 'PART' },
    { key: 'product_sku', label: 'SKU' },
    { key: 'quantity', label: 'QUANTITY' },
    { key: 'workloads', label: 'WORKLOADS' },
    { key: 'assy_group', label: 'ASSY_GROUP' },
    { key: 'part', label: 'PART' },
    { key: 'no_mode', label: 'NO_MODE' },
    { key: 'total_length', label: 'TOTAL_LENGTH' },
    { key: 'stripping_front', label: 'STRIPPING_FRONT' },
    { key: 'stripping_rear', label: 'STRIPPING_REAR' },
    { key: 'half_strip_front', label: 'HALF_STRIP_FRONT' },
    { key: 'half_strip_end', label: 'HALF_STRIP_END' },
    { key: 'insulation_front', label: 'INSULATION_FRONT' },
    { key: 'insulation_back', label: 'INSULATION_BACK' },
    { key: 'core_diameter', label: 'CORE_DIAMETER' },
    { key: 'blade_move_back', label: 'BLADE_MOVE_BACK' },
    { key: 'depth_of_blade', label: 'DEPTH_OF_BLADE' },
    { key: 'length_of_mb', label: 'LENGTH_OF_MB' },
    { key: 'estimate_start', label: 'ESTIMATE_START' },
    { key: 'estimate_end', label: 'ESTIMATE_END' },
    { key: 'actual_start', label: 'ACTUAL_START' },
    { key: 'actual_end', label: 'ACTUAL_END' },
    { key: 'used_machine', label: 'USED_MACHINE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' }
] as const

export default function WarehouseCard() {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [listOrders, setListOrders] = useState<Order[]>([]);
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'order_number', order: 'asc' },
    ])

    const email = useUserStore((state) => state.email)
    const { open } = useSidebarStore();

    useEffect(() => {
        const payload = { email, status: "Done" }

        const fetcher = async () => {
            const resCustomer = await fetch("/api/getter/getOrderByEmailStatus", {
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

        if (email) fetcher()

    }, [email])


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

    const handleDownload = async () => {
        setLoading(true);

        try {
            const plainArray = listOrders.map(order => [
                order.order_number,
                order.actual_start,         // or format date if needed
                order.actual_end,
                order.assy_group,
                order.part,
                order.no_mode,
                order.total_length,
                order.stripping_front,
                order.stripping_rear,
                order.half_strip_front,
                order.half_strip_end,
                order.insulation_front,
                order.insulation_back,
                order.core_diameter,
                order.blade_move_back,
                order.depth_of_blade,
                order.length_of_mb
            ]);

            const res = await fetch("/api/xlsx/exportExcel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: plainArray })
            });

            if (!res.ok) throw new Error("Failed to download");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `order-completed.xlsx`; // default file name
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">
                Completed Orders Warehouse
            </h2>
            <div className="flex justify-end mt-10">
                <Button
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={handleDownload}
                >
                    {
                        loading ?
                            "Downloading..."
                            :
                            "Export to CSV"
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
                            {columns.map(({ key, label }) => (
                                <TableHead key={key} className="text-center">
                                    {key === 'action' ? (
                                        <span className="font-semibold">{label}</span>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort(key as SortKey)}
                                            className="font-semibold"
                                        >
                                            {label}
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
                                        No data of order available for now
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
                                                                    className='cursor-pointer'
                                                                >
                                                                    EDIT
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-red-500 focus:text-red-600"
                                                                >
                                                                    DELETE
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                ) : (
                                                    data[key]
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