export interface Alarm {
    id: string
    open_date: string
    alarm: string
    open_by: string
    status: string
    closed_by: string
    closed_date: string
    note: string
}

export type DialogAlarmProps = {
    isEdit?: boolean
    alarmData?: Alarm
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export type DataAlarmProps = {
    data: Alarm[]
    onAlarmUpdated?: () => void
    onDelete?: (alarm: Alarm) => void
}