"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from '../../../../store/userStore'
import { Machine } from "../../../../types/setup/machine"
import { formattedDate } from "@/lib/dateUtils"

export default function MachineCard() {
    const [search, setSearch] = useState<string>("")
    const [machineId, setMachineId] = useState<string>("")
    const [machineNumber, setMachineNumber] = useState<string>("")
    const [machineName, setMachineName] = useState<string>("")
    const [maxCapacity, setMaxCapacity] = useState<string>("")
    const [machineType, setMachineType] = useState<string>("")
    const [listMachines, setListMachines] = useState<Machine[]>([])

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [isFetched, setIsFetched] = useState<boolean>(false)
    const [isAddMachine, setIsAddMachine] = useState<boolean>(false)
    const [isEditMachine, setIsEditMachine] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const email = useUserStore((state) => state.email)

    useEffect(() => {
        const payload = {
            email: email,
        }

        const getMachinesByEmail = async () => {
            const res = await fetch("/api/getter/getMachinesByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const response = await res.json()

            const fixedResponse = Array.isArray(response?.data)
                ? response.data.map((res: Machine) => {
                    return {
                        ...res,
                        created_on: formattedDate(res.created_on)
                    }
                })
                : []

            setListMachines(fixedResponse)
            setIsFetched(true)
        }

        getMachinesByEmail()

    }, [email, search, isAddMachine, isEditMachine, refreshKey])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            number: machineNumber,
            name: machineName,
            capacity: maxCapacity,
            type: machineType
        }

        if (isEditMachine) {
            const body = {
                ...payload,
                identifier: machineId
            }
            const res = await fetch("/api/patcher/updateMachineByIdentifier", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Machine Updated Successfully!")
                setIsSubmitted(false)
                setIsEditMachine(false)
                setIsAddMachine(false)
            } else {
                toast.error("Failed to Update Machine!")
                setIsSubmitted(false)

            }

        } else if (isAddMachine) {
            const res = await fetch("/api/insert/addMachine", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Machine Added Successfully!")
                setIsSubmitted(false)
                setIsAddMachine(false)
                setIsEditMachine(false)
            } else {
                toast.error("Failed to Add Machine!")
                setIsSubmitted(false)
            }
        }
    }

    const filteredMachines = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (listMachines?.length > 0) {
            return listMachines.filter(machine =>
                machine.name.toLowerCase().includes(keyword)
            );
        }

        return []
    }, [listMachines, search]);

    const handleEdit = async (machine: Machine) => {
        setIsAddMachine(true) // To activate the red cancel button
        setIsEditMachine(true)

        // Mapping the parameters of each machine to the state
        setMachineId(machine.identifier)
        setMachineNumber(machine.number)
        setMachineName(machine.name)
        setMaxCapacity(machine.capacity)
        setMachineType(machine.type)
    }

    const handleDelete = async (machine: Machine) => {
        const payload = {
            identifier: machine.identifier
        }
        await fetch("/api/remover/deleteMachineByIdentifier", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setRefreshKey((prev) => prev + 1)
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="flex flex-col min-h-screen gap-4">
                <div className="w-full max-h-full rounded">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            Machine Management
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder="Search machines..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setIsAddMachine(false)
                                }}
                            // className="w-[200px]"
                            />
                            <Button
                                className="cursor-pointer"
                                variant={`${isAddMachine ? 'destructive' : 'default'}`}
                                onClick={() => {
                                    setSearch("")
                                    setIsAddMachine(!isAddMachine)
                                    setMachineNumber("")
                                    setMachineName("")
                                    setMaxCapacity("")
                                    setMachineType("")
                                }}>
                                {
                                    isAddMachine ? "Cancel" : "Add Machine"
                                }
                            </Button>
                        </div>
                    </div>

                    {
                        isAddMachine &&
                        <>
                            <h2 className="text-2xl font-semibold text-center my-8">
                                {
                                    isEditMachine ? "Edit Machine" : "Add Machine"
                                }
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="machineNumber">Machine Number</Label>
                                    <Input
                                        id="machineNumber"
                                        type="text"
                                        value={machineNumber}
                                        onChange={(e) => setMachineNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="machineName">Machine Name</Label>
                                    <Input
                                        id="machineName"
                                        type="text"
                                        value={machineName}
                                        onChange={(e) => setMachineName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="maxCapacity">Max Capacity (items/hour)</Label>
                                    <Input
                                        id="maxCapacity"
                                        type="number"
                                        min={0}
                                        value={maxCapacity}
                                        onChange={(e) => setMaxCapacity(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="machineType">Machine Type *</Label>
                                    <Select value={machineType} onValueChange={setMachineType}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select or type a machine type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Type A">Type A</SelectItem>
                                            <SelectItem value="Type B">Type B</SelectItem>
                                            <SelectItem value="Type C">Type C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        *For custom machine type just type custom name in this input field.
                                    </p>
                                    <Input
                                        className="mt-2"
                                        placeholder="Custom machine type..."
                                        value={machineType}
                                        onChange={(e) => setMachineType(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-center gap-4 mt-6">
                                    <Button
                                        className="w-full cursor-pointer"
                                        type="submit"
                                        disabled={!machineNumber || !machineType}
                                    >
                                        {isSubmitted ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-0">Submitting</span>
                                            </>
                                        ) :
                                            isEditMachine ? "UPDATE MACHINE" : "ADD MACHINE"
                                        }
                                    </Button>
                                </div>
                            </form>
                        </>
                    }
                </div>
                <div className="grid lg:grid-cols-3 gap-2 mt-10">
                    {
                        isFetched ? (
                            filteredMachines.length === 0 ? (
                                <div className="col-span-full text-center mt-10 text-muted-foreground">
                                    No Machines Found.
                                </div>
                            ) : (
                                filteredMachines.map((machine) => (
                                    <Card className="w-full" key={machine.identifier}>
                                        <CardHeader>
                                            <CardTitle className="text-center text-lg">{machine.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <div><strong>Machine Number:</strong> {machine.number}</div>
                                            <div><strong>Machine Type:</strong> {machine.type}</div>
                                            <div><strong>Max Capacity:</strong> {machine.capacity} Items/ Hour</div>
                                            <div><strong>Installation Date:</strong> {machine.created_on}</div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="secondary"
                                                    onClick={() => handleEdit(machine)}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(machine)}
                                                >
                                                    DELETE
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )
                        ) : (
                            [...Array(3)].map((_, index) => (
                                <Card className="w-full" key={index}>
                                    <CardHeader>
                                        <CardTitle className="text-center text-lg">
                                            <Skeleton className="h-6 w-32 mx-auto" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <div><strong>Machine Number:</strong> <Skeleton className="inline-block h-4 w-20 ml-2" /></div>
                                            <div><strong>Machine Type:</strong> <Skeleton className="inline-block h-4 w-24 ml-2" /></div>
                                            <div><strong>Max Capacity:</strong> <Skeleton className="inline-block h-4 w-28 ml-2" /></div>
                                            <div><strong>Installation Date:</strong> <Skeleton className="inline-block h-4 w-32 ml-2" /></div>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-4">
                                            <Skeleton className="h-9 w-full rounded" />
                                            <Skeleton className="h-9 w-full rounded" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    }
                </div>
            </div>
        </>
    )
}
