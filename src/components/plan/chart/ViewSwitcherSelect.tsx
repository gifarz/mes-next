"use client";

import * as React from "react";
import { ViewMode } from "gantt-task-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type ViewSwitcherProps = {
    isChecked: boolean;
    onViewListChange: (isChecked: boolean) => void;
    onViewModeChange: (viewMode: ViewMode) => void;
};

const viewModes = [
    { label: "Hour", value: ViewMode.Hour },
    { label: "Quarter Day", value: ViewMode.QuarterDay },
    { label: "Half Day", value: ViewMode.HalfDay },
    { label: "Day", value: ViewMode.Day },
    { label: "Week", value: ViewMode.Week },
    { label: "Month", value: ViewMode.Month },
    { label: "Year", value: ViewMode.Year },
];

export const ViewSwitcherSelect: React.FC<ViewSwitcherProps> = ({
    onViewModeChange,
}) => {
    const [selected, setSelected] = React.useState(ViewMode.Day);

    return (
        <div>
            <Select
                value={selected}
                onValueChange={(value: ViewMode) => {
                    setSelected(value);
                    onViewModeChange(value);
                }}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                    {viewModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
