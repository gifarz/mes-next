'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import { Order } from '../../../../types/plan/order'
import { useSidebarStore } from '../../../../store/sidebarStore'
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
    // { key: 'action', label: 'ACTION' }
] as const

export default function WarehouseCard() {
    const [loading, setLoading] = useState(false);
    const [listOrders, setListOrders] = useState<Order[]>([]);
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'order_number', order: 'asc' },
    ])

    const { open } = useSidebarStore();

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

    }, [])


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
            "1",
            "Operator",
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
            "QC",
            "CHECKER"
        ]);

        // 5. Append data starting from row 3
        worksheet?.addRows(plainArray);

        // 6. Export the updated workbook
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Order Completed.xlsx");

        setLoading(false);
    };

    return (
        <div>
            <div className="flex justify-end mt-10">
                <Button
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={handleExport}
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
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort(key as SortKey)}
                                        className="font-semibold"
                                    >
                                        {label}
                                        <SortIcon column={key as SortKey} />
                                    </Button>
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
                                                {data[key] || "-"}
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