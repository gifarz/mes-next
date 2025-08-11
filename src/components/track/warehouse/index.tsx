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

type SortKey = keyof Order
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'order_number', label: 'ORDER_NUMBER' },
    { key: 'customer_name', label: 'CUSTOMER' },
    { key: 'product_name', label: 'PRODUCT' },
    { key: 'quantity', label: 'QUANTITY' },
    { key: 'delivery_date', label: 'DELIVERY_DATE' },
    { key: 'action', label: 'ACTION' },
] as const

export default function WarehouseCard() {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [listOrders, setListOrders] = useState<Order[]>([]);
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'order_number', order: 'asc' },
    ])

    const email = useUserStore((state) => state.email)

    useEffect(() => {
        const payload = { email }

        const fetcher = async () => {
            const resCustomer = await fetch("/api/getter/getOrderByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataOrders = await resCustomer.json()
            setListOrders(dataOrders.data)
        }

        if (email) fetcher()

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

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">
                Completed Orders Warehouse
            </h2>
            <Table className='mt-10'>
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
                        listOrders.length === 0 ?
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
    )
}