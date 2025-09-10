'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '../../../../types/plan/order'
import { toast } from 'sonner'
import EditOrderTable from '../dialog/edit-order-table'
import { Product } from '../../../../types/setup/product'
import { Customer } from '../../../../types/setup/customer'
import { useI18n } from '@/components/i18n/provider'

type SortKey = keyof Order
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'order_number', label: 'ORDER_NUMBER' },
    { key: 'customer_name', label: 'CUSTOMER' },
    { key: 'product_name', label: 'PRODUCT' },
    // { key: 'part', label: 'PART' },
    { key: 'quantity', label: 'QUANTITY' },
    // { key: 'duration', label: 'DURATION' },
    // { key: 'remaining', label: 'REMAINING' },
    { key: 'delivery_date', label: 'DELIVERY_DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
] as const

type OrderProps = {
    listOrders: Order[]
    listProducts: Product[]
    listCustomers: Customer[]
    onOrderUpdated?: () => void
}

export default function OrderTable({ listOrders, listProducts, listCustomers, onOrderUpdated }: OrderProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [orderData, setOrderData] = useState<Order>()

    const { t } = useI18n();
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'order_number', order: 'asc' },
    ])

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

    const handleDelete = async (data: Order) => {
        const res = await fetch("/api/remover/deleteOrderByIdentifier", {
            method: "POST",
            body: JSON.stringify({ identifier: data.identifier }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (res.ok) {
            toast.success(`${t("order")} ${data.order_number} ${t("hasBeenDeleted")}`)
        } else {
            toast.error(`${t("failDeleteOrder")} ${data.order_number}`)
        }

        onOrderUpdated?.()
    }

    return (
        <div>
            {
                orderData ?
                    <EditOrderTable
                        open={openDialog}
                        onOpenChange={setOpenDialog}
                        orderData={orderData}
                        listProducts={listProducts}
                        listCustomers={listCustomers}
                        onOrderUpdated={onOrderUpdated}
                    />
                    :
                    ""
            }

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        <h2 className="text-2xl font-semibold mb-4 text-center">{t("orderTable")}</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(({ key }) => (
                                    <TableHead key={key} className="text-center">
                                        {key === 'action' ? (
                                            <span className="font-semibold">{t(key).toUpperCase()}</span>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort(key as SortKey)}
                                                className="font-semibold"
                                            >
                                                {t(key).toUpperCase()}
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
                                                                        className='cursor-pointer'
                                                                        onClick={() => {
                                                                            setOrderData(data)
                                                                            setOpenDialog(true)
                                                                        }}
                                                                    >
                                                                        {t("edit").toUpperCase()}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(data)}
                                                                        className="cursor-pointer text-red-500 focus:text-red-600"
                                                                    >
                                                                        {t("delete").toUpperCase()}
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
                </CardContent>
            </Card>

        </div>
    )
}