'use client';

import React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import { ViewSwitcher } from './ViewSwitcher';
import { getStartEndDateForProject, initTasks } from '@/lib/ganttHelper';
import { ViewSwitcherSelect } from './ViewSwitcherSelect';

type GanttChartProps = {
    isSidebarOpen: boolean
}

const GanttChart = ({ isSidebarOpen }: GanttChartProps) => {
    const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
    const initialTasks = React.useMemo(() => initTasks(), []);
    const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
    const [isChecked, setIsChecked] = React.useState(false);
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        setReady(true);
    }, []);

    let columnWidth = 65;
    if (view === ViewMode.Year) {
        columnWidth = 350;
    } else if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

    return (
        <div className="Wrapper">
            <ViewSwitcherSelect
                onViewModeChange={viewMode => setView(viewMode)}
                onViewListChange={setIsChecked}
                isChecked={isChecked}
            />
            <div className="overflow-x-auto w-full">
                <div
                    style={{
                        width: isSidebarOpen ? "calc(100vw - 380px)" : "calc(100vw - 140px)",
                    }}
                >
                    {ready && (
                        <Gantt
                            tasks={tasks}
                            viewMode={view}
                            listCellWidth={isChecked ? "155px" : ""}
                            columnWidth={columnWidth}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
