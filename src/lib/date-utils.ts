import { format, parseISO } from "date-fns";

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    return "Invalid date";
  }
}

export function formatDateWithTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  } catch (error) {
    return "Invalid date";
  }
}