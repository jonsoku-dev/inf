import { DateTime } from "luxon";

export function formatDate(date: string) {
    return DateTime.fromISO(date).toFormat("yyyy.MM.dd");
} 