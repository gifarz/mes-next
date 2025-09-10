'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import AddEditInventory from '../add-edit'
import { DataInventoryProps, Inventory } from '../../../../../types/setup/inventory'
import { useI18n } from '@/components/i18n/provider'

type SortKey = keyof Inventory
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'created_on', label: 'CREATED_ON' },
    { key: 'name', label: 'NAME' },
    { key: 'code', label: 'CODE' },
    { key: 'cost', label: 'COST' },
    { key: 'quantity', label: 'QUANTITY' },
    { key: 'action', label: 'ACTION' },
] as const

export default function InventoryDataTable({ data, onInventoryUpdated }: DataInventoryProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [inventoryData, setInventoryData] = useState<Inventory>();
    const { t } = useI18n();

    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'created_on', order: 'asc' },
        { key: 'name', order: 'asc' },
    ])

    const sortedData = [...data].sort((a, b) => {
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

    const handleDelete = async (inventory: Inventory) => {
        const payload = {
            identifier: inventory.identifier
        }
        await fetch("/api/remover/deleteInventoryByIdentifier", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });
        onInventoryUpdated?.()
    }

    return (
        <div>
            <AddEditInventory
                isEdit={true}
                inventoryData={inventoryData}
                open={openDialog}
                onOpenChange={(open) => {
                    setOpenDialog(open)
                    if (!open) {
                        onInventoryUpdated?.() // 👈 Trigger refresh on close
                    }
                }}
            />
            <Table className='mt-10'>
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
                            sortedData.map((inventory) => (
                                <TableRow key={inventory.identifier} className="text-center">
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
                                                                    setOpenDialog(true)
                                                                    setInventoryData(inventory)
                                                                }}
                                                            >
                                                                {t("edit").toUpperCase()}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(inventory)}
                                                                className="cursor-pointer text-red-500 focus:text-red-600"
                                                            >
                                                                {t("delete").toUpperCase()}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            ) : (
                                                inventory[key]
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
