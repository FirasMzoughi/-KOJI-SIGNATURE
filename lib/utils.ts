import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Or custom currency symbol if preferred
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "N/A";

  const dateObj = new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(dateObj);
}
