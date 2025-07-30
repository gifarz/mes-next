import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

interface TimeInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function TimeInput({ label, value, onChange }: TimeInputProps) {

    const inputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        inputRef.current?.showPicker?.(); // Chromium browsers
        inputRef.current?.focus();
    };

    return (
        <div className="space-y-1 w-full">
            <Label>{label}</Label>
            <div className="relative">
                <Input
                    ref={inputRef}
                    type="time"
                    value={value}
                    className="w-full pr-10
                    appearance-none
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:right-3
                    [&::-webkit-calendar-picker-indicator]:opacity-0
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    onChange={(e) => onChange(e.target.value)}
                />
                <Clock
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                    onClick={handleIconClick}
                />
            </div>
        </div>
    );
}
