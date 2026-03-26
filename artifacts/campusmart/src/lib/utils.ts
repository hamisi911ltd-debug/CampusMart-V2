import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKES(amount: number | undefined): string {
  if (amount === undefined) return "KES 0";
  return `KES ${amount.toLocaleString()}`;
}
