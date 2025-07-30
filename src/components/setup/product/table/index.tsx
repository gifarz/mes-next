'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"

type Product = {
    identifier: string
    name: string
    sku_code: number
    part: string
    inventory_code: number
    cost: number
}

const data: Product[] = [
    { identifier: '1', name: 'Alice', sku_code: 12345, part: 'qwerty', inventory_code: 12345, cost: 12345 },
    { identifier: '2', name: 'Bob', sku_code: 12345, part: 'qwerty', inventory_code: 12345, cost: 12345 },
    { identifier: '3', name: 'Charlie', sku_code: 12345, part: 'qwerty', inventory_code: 12345, cost: 12345 },
]

type SortKey = keyof Product
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

export default function SortableTable() {
    // const [sortKeys, setSortKeys] = useState<SortKey[]>(['name', 'age'])
    // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'name', order: 'asc' },
        { key: 'sku_code', order: 'asc' },
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



    return (
        <Table className='mt-10'>
            <TableHeader>
                <TableRow>
                    {['name', 'sku code', 'part', 'inventory code', 'cost'].map((key) => (
                        <TableHead key={key} className='text-center'>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort(key as SortKey)}
                                className="font-semibold"
                            >
                                {key.toUpperCase()} <SortIcon column={key as SortKey} />
                            </Button>
                        </TableHead>

                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedData.map((product) => (
                    <TableRow key={product.identifier} className='text-center'>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku_code}</TableCell>
                        <TableCell>{product.part}</TableCell>
                        <TableCell>{product.inventory_code}</TableCell>
                        <TableCell>{product.cost}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
