'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TimeInput } from "@/components/ui/time-input";
import { InfoRow } from "@/components/ui/info-row";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useUserStore } from '../../../../store/userStore';

export default function FactoryCard() {
    const [factoryName, setFactoryName] = useState<string>('');
    const [factoryType, setFactoryType] = useState<string>('');
    const [productionModel, setProductionModel] = useState<string>('');
    const [operationStart, setOperationStart] = useState<string>('');
    const [operationEnd, setOperationEnd] = useState<string>('');
    const [overtimeStart, setOvertimeStart] = useState<string>('');
    const [overtimeEnd, setOvertimeEnd] = useState<string>('');
    const [operationDays, setOperationDays] = useState<string[]>([]);
    const [productivityOptimization, setProductivityOptimization] = useState('');
    const [workUtilization, setWorkUtilization] = useState('');
    const [standardMachinery, setStandardMachinery] = useState('');
    const [acceptableWaste, setAcceptableWaste] = useState('');
    const [rescheduleInterval, setRescheduleInterval] = useState('');

    const [isSubmitted, setIsSubmitted] = useState(false);

    // For checking is the user has the factory or not
    const factory = useUserStore((state) => state.factory)
    const setFactory = useUserStore((state) => state.setUser)

    useEffect(() => {

        if (factory.length === 0) return

        const data = factory[0]

        setFactoryName(data.name || '');
        setFactoryType(data.type || '');
        setProductionModel(data.production_model || '');
        setOperationStart(data.operation_start || '');
        setOperationEnd(data.operation_end || '');
        setOvertimeStart(data.overtime_start || '');
        setOvertimeEnd(data.overtime_end || '');
        setOperationDays(data.operation_day?.split(",") || []);
        setProductivityOptimization(data.productivity_optimization || '');
        setWorkUtilization(data.work_utilization || '');
        setStandardMachinery(data.standard_machine_efficiency || '');
        setAcceptableWaste(data.acceptable_waste || '');
        setRescheduleInterval(data.reschedule_interval || '');

    }, [factory, isSubmitted]);

    const toggleDay = (day: string) => {
        setOperationDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleAddFactory = async () => {
        setIsSubmitted(true)
        const payload = {
            name: factoryName,
            type: factoryType,
            production_model: productionModel,
            operation_start: operationStart,
            operation_end: operationEnd,
            overtime_start: overtimeStart,
            overtime_end: overtimeEnd,
            operation_day: operationDays.join(","),
            productivity_optimization: productivityOptimization,
            work_utilization: workUtilization,
            standard_machine_efficiency: standardMachinery,
            acceptable_waste: acceptableWaste,
            reschedule_interval: rescheduleInterval,
        };

        const res = await fetch("/api/insert/addFactory", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success("The Factory Added Successfully!")
            setFactory({
                factory: [
                    {
                        name: factoryName,
                        type: factoryType,
                        production_model: productionModel,
                        operation_start: operationStart,
                        operation_end: operationEnd,
                        overtime_start: overtimeStart,
                        overtime_end: overtimeEnd,
                        operation_day: operationDays.join(','),
                        productivity_optimization: productivityOptimization,
                        work_utilization: workUtilization,
                        standard_machine_efficiency: standardMachinery,
                        acceptable_waste: acceptableWaste,
                        reschedule_interval: rescheduleInterval,
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
            type: factoryType,
            production_model: productionModel,
            operation_start: operationStart,
            operation_end: operationEnd,
            overtime_start: overtimeStart,
            overtime_end: overtimeEnd,
            operation_day: operationDays.join(","),
            productivity_optimization: productivityOptimization,
            work_utilization: workUtilization,
            standard_machine_efficiency: standardMachinery,
            acceptable_waste: acceptableWaste,
            reschedule_interval: rescheduleInterval,
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

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            {console.log('operationDays', operationDays)}
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

                        {/* Factory Type */}
                        <div className="w-full space-y-1">
                            <Label>Factory Type *</Label>
                            <Select
                                value={factoryType}
                                onValueChange={(value) => setFactoryType(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select factory type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Job Shop">Job Shop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Production Model */}
                        <div className="w-full space-y-1">
                            <Label>Production Model *</Label>
                            <Select
                                value={productionModel}
                                onValueChange={(value) => setProductionModel(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Serial">Serial</SelectItem>
                                    <SelectItem value="Parallel">Parallel</SelectItem>
                                    <SelectItem value="Single-Multi Component">Single-Multi Component</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Pickers */}
                        <TimeInput label="Operation Start" value={operationStart} onChange={setOperationStart} />
                        <TimeInput label="Operation End" value={operationEnd} onChange={setOperationEnd} />
                        <TimeInput label="Overtime Start" value={overtimeStart} onChange={setOvertimeStart} />
                        <TimeInput label="Overtime End" value={overtimeEnd} onChange={setOvertimeEnd} />

                        {/* Operation Days */}
                        <div className="mt-4">
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
                        </div>

                        {/* Productivity Optimization */}
                        <div className="w-full space-y-1">
                            <Label>Productivity Optimization</Label>
                            <Select
                                value={productivityOptimization}
                                onValueChange={(value) => setProductivityOptimization(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Reduce Cost">Reduce Cost</SelectItem>
                                    <SelectItem value="Increase Profit">Increase Profit</SelectItem>
                                    <SelectItem value="Disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Work Utilization */}
                        <div className="space-y-1">
                            <Label htmlFor="workUtilization">Work Utilization (30 - 100%)</Label>
                            <Input
                                id="workUtilization"
                                placeholder="0"
                                type="number"
                                min={0}
                                onChange={(e) => setWorkUtilization(e.target.value)}
                                value={workUtilization}
                            />
                        </div>

                        {/* Standard Machinery Effieciency */}
                        <div className="space-y-1">
                            <Label htmlFor="standardMachinery">Standard Machinery Effieciency (30 - 100%)</Label>
                            <Input
                                id="standardMachinery"
                                placeholder="0"
                                type="number"
                                min={0}
                                onChange={(e) => setStandardMachinery(e.target.value)}
                                value={standardMachinery}
                            />
                        </div>

                        {/* Acceptable Waste */}
                        <div className="space-y-1">
                            <Label htmlFor="acceptableWaste">Acceptable Waste(0.00 - 1.00)</Label>
                            <Input
                                id="acceptableWaste"
                                placeholder="0"
                                type="number"
                                min={0}
                                onChange={(e) => setAcceptableWaste(e.target.value)}
                                value={acceptableWaste}
                            />
                        </div>

                        {/* Reschedule Interval */}
                        <div className="w-full space-y-1">
                            <Label>Reschedule Interval (Days)</Label>
                            <Select
                                value={rescheduleInterval}
                                onValueChange={(value) => setRescheduleInterval(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                    <SelectItem value="7">7</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Delay Between Station */}
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full cursor-pointer mt-6"
                        onClick={factory.length > 0 ? handleUpdateFactory : handleAddFactory}
                        disabled={!factoryName || !factoryType || !productionModel || !operationStart || !operationEnd || !overtimeStart || !overtimeEnd || !productivityOptimization || !workUtilization || !standardMachinery || !acceptableWaste || !rescheduleInterval || !operationDays || isSubmitted}
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

                        <div className="divide-y">
                            <InfoRow label="Factory Name" value={factoryName} />
                            <InfoRow label="Factory Type" value={factoryType} />
                            <InfoRow label="Production Model" value={productionModel} />
                            <InfoRow label="Operation Start" value={operationStart} />
                            <InfoRow label="Operation End" value={operationEnd} />
                            <InfoRow label="Overtime Start" value={overtimeStart} />
                            <InfoRow label="Overtime End" value={overtimeEnd} />
                            <InfoRow label="Operation Day" value={operationDays.toString()} />
                        </div>
                    </div>
                    <div className="border-1 w-full max-h-full rounded p-4">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            Factory Global Standard
                        </h2>
                        <div className="divide-y">
                            <InfoRow label="Productivity Optimization" value={productivityOptimization} />
                            <InfoRow label="Work Utilization" value={workUtilization} />
                            <InfoRow label="Standard Machine Efficiency" value={standardMachinery} />
                            <InfoRow label="Acceptable Waste" value={acceptableWaste} />
                            <InfoRow label="Reschedule Interval" value={rescheduleInterval} />
                            <InfoRow label="Last Reschedule" value="" />
                            <InfoRow label="Next Reschedule" value="" />
                            <InfoRow label="Delay Between Station" value="" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
