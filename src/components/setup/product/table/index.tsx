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
import AddEditProduct from '../add-edit'
import { DataProductProps, Product } from '../../../../../types/setup/product'
import { useSidebarStore } from '../../../../../store/sidebarStore'

type SortKey = keyof Product
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    { key: 'created_on', label: 'CREATED_ON' },
    { key: 'name', label: 'NAME' },
    { key: 'code', label: 'PRODUCT CODE' },
    { key: 'part_name', label: 'PART' },
    { key: 'part_code', label: 'PART CODE' },
    { key: 'part_material', label: 'INVENTORY CODE' },
    { key: 'part_material_quantity', label: 'INVENTORY QUANTITY' },
    { key: 'action', label: 'ACTION' },
] as const

export default function ProductDataTable({ data, onProductUpdated }: DataProductProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [productData, setProductData] = useState<Product>();
    const { open } = useSidebarStore();

    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'name', order: 'asc' },
        { key: 'code', order: 'asc' },
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

    const handleDelete = async (product: Product) => {
        const payload = {
            identifier: product.identifier
        }
        await fetch("/api/remover/deleteProductByIdentifier", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });
        onProductUpdated?.()
    }

    return (
        <div>
            <AddEditProduct
                isEdit={true}
                productData={productData}
                open={openDialog}
                onOpenChange={(open) => {
                    setOpenDialog(open)
                    if (!open) {
                        onProductUpdated?.() // 👈 Trigger refresh on close
                    }
                }}
            />
            <div className="mt-10 overflow-x-auto"
                style={{
                    width: open ? "calc(100vw - 380px)" : "calc(100vw - 140px)",
                }}>
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
                                        No data of product available for now
                                    </TableCell>
                                </TableRow>
                                :
                                sortedData.map((product) => (
                                    <TableRow key={product.identifier} className="text-center">
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
                                                                        setProductData(product)
                                                                    }}
                                                                >
                                                                    EDIT
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(product)}
                                                                    className="cursor-pointer text-red-600 focus:text-red-700"
                                                                >
                                                                    DELETE
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                ) : (
                                                    product[key]
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
