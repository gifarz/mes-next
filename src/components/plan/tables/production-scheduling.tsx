'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import { Scheduling } from '../../../../types/plan/scheduling'
import { Checkbox } from '@/components/ui/checkbox'

type SortKey = keyof Scheduling
type SortRule = {
    key: SortKey
    order: 'asc' | 'desc'
}

const columns = [
    // { key: 'station_name', label: 'STATION' },
    { key: 'order_number', label: 'ORDER_NUMBER' },
    { key: 'customer_name', label: 'CUSTOMER' },
    { key: 'product_name', label: 'PRODUCT' },
    { key: 'product_code', label: 'CODE' },
    { key: 'part_name', label: 'PART' },
    { key: 'quantity', label: 'QUANTITY' },
    // { key: 'workloads', label: 'WORKLOADS' },
    // { key: 'estimate_start', label: 'ESTIMATE_START' },
    // { key: 'estimate_end', label: 'ESTIMATE_END' },
    // { key: 'used_machine', label: 'USED_MACHINE' },
    { key: 'status', label: 'STATUS' }
] as const

type ProductionSchedulingProps = {
    listData: Scheduling[]
    selectedStation: string
    isSidebarOpen: boolean
    onSelectedRows: (stationName: string[]) => void
}

export default function ProductionScheduling({ listData, selectedStation, isSidebarOpen, onSelectedRows }: ProductionSchedulingProps) {
    const [filteredData, setFilteredData] = useState<Scheduling[]>([])
    const [selectedRows, setSelectedRows] = useState<string[]>([])

    useEffect(() => {
        onSelectedRows(selectedRows)

        if (selectedStation) {
            setFilteredData(
                listData.filter(order => order.station_name === selectedStation)
            );
        } else {
            setFilteredData(listData)
        }
    }, [listData, selectedStation, selectedRows])

    const [sortRules, setSortRules] = useState<SortRule[]>([
        { key: 'order_number', order: 'asc' },
    ])

    const sortedData = [...filteredData].sort((a, b) => {
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

    const toggleSelectAll = (checked: boolean) => {
        setSelectedRows(checked ? sortedData.map(d => d.identifier) : [])
    }

    const toggleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev =>
            checked ? [...prev, id] : prev.filter(item => item !== id)
        )
    }

    return (
        <div
            className="overflow-x-auto"
            style={{
                width: isSidebarOpen ? "calc(100vw - 400px)" : "calc(100vw - 140px)",
            }}
        >
            <Table className="min-w-max">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">
                            <Checkbox
                                checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                                onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                            />
                        </TableHead>
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
                    {sortedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} className="text-center py-10 text-muted-foreground">
                                No data available for now
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedData.map((data) => (
                            <TableRow key={data.identifier} className="text-center">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(data.identifier)}
                                        onCheckedChange={(checked) => toggleSelectRow(data.identifier, !!checked)}
                                    />
                                </TableCell>
                                {columns.map(({ key }) => (
                                    <TableCell key={key}>
                                        {data[key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}