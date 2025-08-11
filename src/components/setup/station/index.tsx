"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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
import { formattedDate } from "@/lib/dateUtils"
import { Station } from "../../../../types/setup/station"
import { Machine } from "../../../../types/setup/machine"

export default function StationCard() {
    const [search, setSearch] = useState("")
    const [stationId, setStationId] = useState("")
    const [stationNumber, setStationNumber] = useState("")
    const [stationName, setStationName] = useState("")
    const [machine, setMachine] = useState("")
    const [listStations, setListStations] = useState<Station[]>([])
    const [listMachines, setListMachines] = useState<Machine[]>([])

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [isFetched, setIsFetched] = useState<boolean>(false)
    const [isAddStation, setIsAddStation] = useState(false)
    const [isEditStation, setIsEditStation] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const email = useUserStore((state) => state.email)
    const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);

    const toggleMachine = (machineName: string) => {
        setSelectedMachines((prev) =>
            prev.includes(machineName)
                ? prev.filter((m) => m !== machineName)
                : [...prev, machineName]
        );
    };

    useLayoutEffect(() => {
        if (triggerRef.current) {
            setContentWidth(triggerRef.current.offsetWidth);
        }
    }, [triggerRef.current, selectedMachines]); // Optional: include state if it might resize

    useEffect(() => {
        const payload = {
            email: email,
        }

        const fetcher = async () => {
            const stations = await fetch("/api/getter/getStationsByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const dataStations = await stations.json()

            const fixedResponse = Array.isArray(dataStations?.data)
                ? dataStations.data.map((res: Station) => ({
                    ...res,
                    // machine_name: res.machine_name.split(","),
                    created_on: formattedDate(res.created_on),
                }))
                : []

            const machines = await fetch("/api/getter/getMachinesByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const res = await machines.json()
            const dataMachines = Array.isArray(res?.data)
                ? res.data.map((res: Machine) => ({
                    ...res,
                    created_on: formattedDate(res.created_on),
                }))
                : []

            setListStations(fixedResponse)
            setListMachines(dataMachines)
            setIsFetched(true)
        }

        fetcher()

    }, [email, search, isAddStation, isEditStation, refreshKey])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            number: stationNumber,
            name: stationName,
            machine_name: selectedMachines.join(",")
        }

        if (isEditStation) {
            const body = {
                ...payload,
                identifier: stationId
            }
            const res = await fetch("/api/patcher/updateStationByIdentifier", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("Successfully Update The Station!")
                setIsSubmitted(false)
                setIsEditStation(false)
            } else {
                toast.error("Failed to Add Station!")
                setIsSubmitted(false)

            }

        } else if (isAddStation) {
            const res = await fetch("/api/insert/addStation", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("The Station Added Successfully!")
                setIsSubmitted(false)
                setIsAddStation(false)
            } else {
                toast.error("Failed to Add Station!")
                setIsSubmitted(false)

            }
        }
    }

    const filteredStations = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (listStations?.length > 0) {
            return listStations.filter(station =>
                station.name.toLowerCase().includes(keyword)
            );
        }

        return []
    }, [listStations, search]);

    const handleEdit = async (station: Station) => {
        setIsAddStation(true) // To activate the red cancel button
        setIsEditStation(true)

        console.log('station', station)

        // Mapping the parameters of each station to the state
        setStationId(station.identifier)
        setStationNumber(station.number)
        setStationName(station.name)
        setSelectedMachines(
            Array.isArray(station.machine_name) ?
                station.machine_name : station.machine_name.split(",")
        )
    }

    const handleDelete = async (station: Station) => {
        const payload = {
            identifier: station.identifier
        }
        await fetch("/api/remover/deleteStationByIdentifier", {
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
                            Station Management
                        </h2>
                        <div className="flex gap-2 ml-auto">
                            <Input
                                type="text"
                                placeholder="Search station..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setIsAddStation(false)
                                }}
                                className="w-[200px]"
                            />
                            <Button
                                className="cursor-pointer"
                                variant={`${isAddStation ? 'destructive' : 'default'}`}
                                onClick={() => {
                                    setSearch("");
                                    setIsAddStation(!isAddStation);
                                    if (isAddStation) {
                                        setIsEditStation(false); // Only reset when toggling off
                                        setStationName("")
                                        setStationNumber("")
                                        setSelectedMachines([])
                                    }
                                }}
                            >
                                {
                                    isAddStation ? "Cancel" : "Add Station"
                                }
                            </Button>
                        </div>
                    </div>

                    {
                        isAddStation &&
                        <>
                            <h2 className="text-2xl font-semibold text-center my-8">
                                {
                                    isEditStation ? "Edit Station" : "Add Station"
                                }
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="stationNumber">Station Number</Label>
                                    <Input
                                        id="stationNumber"
                                        type="text"
                                        value={stationNumber}
                                        onChange={(e) => setStationNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stationName">Station Name</Label>
                                    <Input
                                        id="stationName"
                                        type="text"
                                        value={stationName}
                                        onChange={(e) => setStationName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="machine">Machine Name</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button ref={triggerRef} variant="outline" className="w-full justify-start">
                                                {selectedMachines.length > 0
                                                    ? selectedMachines.join(", ")
                                                    : "Select machines"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent style={{ width: contentWidth }} className="p-2" align="start">
                                            {listMachines.length === 0 ? (
                                                <p className="w-full text-gray-500">No machines available</p>
                                            ) : (
                                                <div className="flex gap-4">
                                                    {
                                                        listMachines.map((machine) => (
                                                            <div
                                                                key={machine.identifier}
                                                                className="flex items-center space-x-2 py-1"
                                                            >
                                                                <Checkbox
                                                                    id={machine.identifier}
                                                                    checked={selectedMachines.includes(machine.name)}
                                                                    onCheckedChange={() => toggleMachine(machine.name)}
                                                                />
                                                                <label
                                                                    htmlFor={machine.identifier}
                                                                    className="leading-none peer-disabled:cursor-not-allowed"
                                                                >
                                                                    {machine.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex justify-center gap-4 mt-6">
                                    <Button
                                        className="w-full cursor-pointer"
                                        type="submit"
                                        disabled={!stationNumber || !stationName || selectedMachines.length == 0}
                                    >
                                        {isSubmitted ? (
                                            <>
                                                <Spinner className="border-white dark:border-black" />
                                                <span className="ml-0">Submitting</span>
                                            </>
                                        ) :

                                            isEditStation ? "UPDATE STATION" : "ADD STATION"
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
                            filteredStations.length === 0 ? (
                                <div className="col-span-full text-center mt-10 text-muted-foreground">
                                    No Stations Found.
                                </div>
                            ) : (
                                filteredStations.map((station) => (
                                    <Card className="w-full max-h-[350px] overflow-y-auto" key={station.identifier}>
                                        <CardHeader>
                                            <CardTitle className="text-center text-lg">{station.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <div><strong>Station Number:</strong> {station.number}</div>
                                            <Accordion
                                                type="single"
                                                collapsible
                                                className="w-full"
                                            >
                                                <AccordionItem value="item-1">
                                                    <AccordionTrigger>List of Machines</AccordionTrigger>
                                                    <AccordionContent className="flex flex-col gap-4 text-balance">
                                                        {station.machine_name.split(',').map((machine, index) => (
                                                            <li key={index}>{machine}</li>
                                                        ))}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                            <div><strong>Installation Date:</strong> {station.created_on}</div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="secondary"
                                                    onClick={() => handleEdit(station)}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(station)}
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
                                            <div><strong>Station Number:</strong> <Skeleton className="inline-block h-4 w-20 ml-2" /></div>
                                            <div><strong>List of Machine(s):</strong> <Skeleton className="inline-block h-4 w-28 ml-2" /></div>
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
