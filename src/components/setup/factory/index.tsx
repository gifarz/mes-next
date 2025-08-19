'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { TimeInput } from "@/components/ui/time-input";
import { InfoRow } from "@/components/ui/info-row";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useUserStore } from '../../../../store/userStore';
import { Textarea } from '@/components/ui/textarea';

export default function FactoryCard() {
    const [factoryName, setFactoryName] = useState<string>('');
    const [factoryDescription, setFactoryDescription] = useState<string>('');
    const [operationStart, setOperationStart] = useState<string>('');
    const [operationEnd, setOperationEnd] = useState<string>('');
    const [overtimeStart, setOvertimeStart] = useState<string>('');
    const [overtimeEnd, setOvertimeEnd] = useState<string>('');
    const [operationDays, setOperationDays] = useState<string[]>([]);

    const [isSubmitted, setIsSubmitted] = useState(false);

    // For checking is the user has the factory or not
    const factory = useUserStore((state) => state.factory)
    const setFactory = useUserStore((state) => state.setUser)

    useEffect(() => {
        if (factory.length === 0) return

        const data = factory[0]

        setFactoryName(data.name || '');
        setFactoryDescription(data.description || '');
        // setOperationStart(data.operation_start || '');
        // setOperationEnd(data.operation_end || '');
        // setOvertimeStart(data.overtime_start || '');
        // setOvertimeEnd(data.overtime_end || '');
        // setOperationDays(data.operation_day?.split(",") || []);

    }, [factory, isSubmitted]);

    // const toggleDay = (day: string) => {
    //     setOperationDays((prev) =>
    //         prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    //     );
    // };

    const handleAddFactory = async () => {
        setIsSubmitted(true)
        const payload = {
            name: factoryName,
            description: factoryDescription,
            // operation_start: operationStart,
            // operation_end: operationEnd,
            // overtime_start: overtimeStart,
            // overtime_end: overtimeEnd,
            // operation_day: operationDays.join(","),
        };

        const res = await fetch("/api/insert/addFactory", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const responseFactory = await res.json()

        if (res.ok) {
            toast.success("The Factory Added Successfully!")
            setFactory({
                factory: [
                    {
                        identifier: responseFactory.data.identifier,
                        name: factoryName,
                        description: factoryDescription,
                        // operation_start: operationStart,
                        // operation_end: operationEnd,
                        // overtime_start: overtimeStart,
                        // overtime_end: overtimeEnd,
                        // operation_day: operationDays.join(','),
                    }
                ]
            })

        } else {
            toast.success("Failed to Add The Factory!")
        }

        setIsSubmitted(false)

    }

    const handleUpdateFactory = async () => {
        setIsSubmitted(true)
        const payload = {
            name: factoryName,
            description: factoryDescription,
            // operation_start: operationStart,
            // operation_end: operationEnd,
            // overtime_start: overtimeStart,
            // overtime_end: overtimeEnd,
            // operation_day: operationDays.join(",")
        };

        const res = await fetch("/api/patcher/updateFactoryByEmail", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success("The Factory Updated Successfully!")
        } else {
            toast.success("Failed to Update The Factory!")
        }

        setIsSubmitted(false)
    }

    // const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            <Toaster position="top-right" />
            <div className="flex flex-col md:flex-row items-start justify-center min-h-screen gap-4">
                {/* Left card with form */}
                <div className="w-full md:w-1/2 border-1 h-auto rounded p-4 overflow-auto">
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Factory Initialize
                    </h2>

                    <div className="space-y-4">
                        {/* Factory Name */}
                        <div className="space-y-1">
                            <Label htmlFor="factoryName">Factory Name</Label>
                            <Input
                                id="factoryName"
                                placeholder="Enter factory name"
                                onChange={(e) => setFactoryName(e.target.value)}
                                value={factoryName}
                            />
                        </div>

                        {/* Factory Description */}
                        <div className="space-y-1">
                            <Label htmlFor="factoryDescription">Factory Description</Label>
                            <Textarea
                                id="factoryDescription"
                                placeholder="Enter factory name"
                                onChange={(e) => setFactoryDescription(e.target.value)}
                                value={factoryDescription}
                            />
                        </div>

                        {/* Time Pickers */}
                        {/* <TimeInput label="Operation Start" value={operationStart} onChange={setOperationStart} />
                        <TimeInput label="Operation End" value={operationEnd} onChange={setOperationEnd} />
                        <TimeInput label="Overtime Start" value={overtimeStart} onChange={setOvertimeStart} />
                        <TimeInput label="Overtime End" value={overtimeEnd} onChange={setOvertimeEnd} /> */}

                        {/* Operation Days */}
                        {/* <div className="mt-4">
                            <Label className="block mb-2">Operation Day</Label>
                            <div className="flex flex-wrap gap-3">
                                {days.map((day) => (
                                    <label key={day} className="flex items-center space-x-2 text-sm">
                                        <Checkbox
                                            checked={operationDays.includes(day)}
                                            onCheckedChange={() => toggleDay(day)}
                                        />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div> */}
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full cursor-pointer mt-6"
                        onClick={factory.length > 0 ? handleUpdateFactory : handleAddFactory}
                        disabled={!factoryName || !factoryDescription || isSubmitted}
                    >
                        {isSubmitted ? (
                            <>
                                <Spinner />
                                <span className="ml-0">Submitting</span>
                            </>
                        ) : (
                            factory.length > 0 ?
                                "UPDATE FACTORY" : "SAVE SETTINGS"
                        )}
                    </Button>
                </div>

                {/* Right column with empty cards */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div className="border-1 w-full max-h-full rounded p-4">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            Factory Information
                        </h2>

                        <div className="divide-y space-y-4">
                            <InfoRow label="Factory Name" value={factoryName} />
                            <InfoRow label="Factory Description" value={factoryDescription} />
                            {/* <InfoRow label="Operation Start" value={operationStart} />
                            <InfoRow label="Operation End" value={operationEnd} />
                            <InfoRow label="Overtime Start" value={overtimeStart} />
                            <InfoRow label="Overtime End" value={overtimeEnd} />
                            <InfoRow label="Operation Day" value={operationDays.toString()} /> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
