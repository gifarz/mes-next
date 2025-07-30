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

interface Stations {
    identifier: string
    factory_id: string
    machine_id: string
    machine_name: string
    number: string
    name: string
    created_on: string
}

interface Machines {
    identifier: string
    name: string
    number: string
    type: string
    capacity: string
    created_on: string
}

export default function StationCard() {
    const [search, setSearch] = useState("")
    const [isAddStation, setIsAddStation] = useState(false)
    const [isEditStation, setIsEditStation] = useState(false)
    const [stationId, setStationId] = useState("")
    const [stationNumber, setStationNumber] = useState("")
    const [stationName, setStationName] = useState("")
    const [machine, setMachine] = useState("")
    const [listStations, setListStations] = useState<Stations[]>([])
    const [listMachines, setListMachines] = useState<Machines[]>([])

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [isFetched, setIsFetched] = useState<boolean>(false)

    const email = useUserStore((state) => state.email)

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

            const machines = await fetch("/api/getter/getMachinesByEmail", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const dataMachines = await machines.json()

            setListStations(dataStations.data)
            setListMachines(dataMachines.data)
            setIsFetched(true)
        }

        fetcher()

    }, [email, search, isAddStation, isEditStation])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        const payload = {
            number: stationNumber,
            name: stationName,
            machine_name: machine
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

    const handleEdit = async (station: Stations) => {
        setIsAddStation(true) // To activate the red cancel button
        setIsEditStation(true)

        // Mapping the parameters of each station to the state
        setStationId(station.identifier)
        setStationNumber(station.number)
        setStationName(station.name)
        setMachine(station.machine_name)
    }

    const handleRemove = async (station: Stations) => {

    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="flex flex-col max-h-full gap-4">
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
                                        setMachine("")
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
                                    <Select value={machine} onValueChange={setMachine}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select machine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                listMachines.map((machine) => (
                                                    <SelectItem value={machine.name} key={machine.identifier}>
                                                        {machine.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-center gap-4 mt-6">
                                    <Button
                                        className="w-full cursor-pointer"
                                        type="submit"
                                        disabled={!stationNumber || !stationName || !machine}
                                    >
                                        {isSubmitted ? (
                                            <>
                                                <Spinner />
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
                                    <Card className="w-full" key={station.identifier}>
                                        <CardHeader>
                                            <CardTitle className="text-center text-lg">{station.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <div><strong>Station Number:</strong> {station.number}</div>
                                            <div><strong>Machine Name:</strong> {station.machine_name}</div>
                                            <div><strong>Installation Date:</strong> {station.created_on}</div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <Button
                                                    className="cusrsor-pointer"
                                                    variant="secondary"
                                                    onClick={() => handleEdit(station)}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button
                                                    className="cusrsor-pointer"
                                                    variant="destructive"
                                                    onClick={() => handleRemove(station)}
                                                >
                                                    REMOVE
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
                                            <div><strong>Machine Name:</strong> <Skeleton className="inline-block h-4 w-28 ml-2" /></div>
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
