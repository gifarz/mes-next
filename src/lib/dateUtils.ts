import { addHours, addMinutes, addSeconds, format } from "date-fns"
import { addDays, subDays, addMonths, subMonths, addYears, subYears, setHours, setMinutes, setSeconds } from "date-fns";

type Unit = "day" | "month" | "year";

/**
 * Increment or decrement a date by a given amount
 * @param date The starting date (Date object or date string)
 * @param amount The number of units to adjust (positive or negative)
 * @param unit The unit of time ("day" | "month" | "year")
 * @returns A new Date object
 */
export function adjustDate(date: Date | string, amount: number, unit: Unit): Date {
    const baseDate = typeof date === "string" ? new Date(date) : date;

    if (unit === "day") {
        return amount >= 0 ? addDays(baseDate, amount) : subDays(baseDate, Math.abs(amount));
    }
    if (unit === "month") {
        return amount >= 0 ? addMonths(baseDate, amount) : subMonths(baseDate, Math.abs(amount));
    }
    if (unit === "year") {
        return amount >= 0 ? addYears(baseDate, amount) : subYears(baseDate, Math.abs(amount));
    }

    throw new Error(`Invalid unit: ${unit}`);
}

export function adjustDayWithTime(date: Date | string, day: number, time: string, extraTime?: string): Date | string {
    let formatted: Date | string

    const [h, m, s] = time.split(":").map(Number);
    const dayAndTime = setSeconds(setMinutes(setHours(addDays(new Date(date), day), h), m), s);

    formatted = format(dayAndTime, "yyyy-MM-dd HH:mm:ss");

    if (extraTime) {
        const [extraH, extraM, extraS] = extraTime.split(":").map(Number);

        // Add the extra time
        formatted = addHours(formatted, extraH);
        formatted = addMinutes(formatted, extraM);
        formatted = addSeconds(formatted, extraS);

        formatted = format(formatted, "yyyy-MM-dd HH:mm:ss");
    }

    return formatted
}

export function formattedDate(isoString: string): string {
    if (!isoString) return "-"
    const date = new Date(isoString)
    return format(date, "yyyy-MM-dd HH:mm:ss")
}

export function formattedDateOnly(isoString: string): string {
    if (!isoString) return "-"
    const date = new Date(isoString)

    return format(date, "yyyy-MM-dd")
}

export function customizeDateString(formatString: string): string {
    const date = new Date()
    return format(date, formatString)
}

export function itemsPerHourToTime(itemsPerHour: number): string {
    const hours = Math.floor(itemsPerHour / 60);
    const minutes = itemsPerHour % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function workloadsTime(rateItemsPerHour: number, requestedItems: number): string {
    const totalHours = (requestedItems / rateItemsPerHour);
    const totalMinutes = totalHours * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
