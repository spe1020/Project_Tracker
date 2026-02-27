import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate trial number in format TR-YYYY-### */
export function generateTrialNumber(existingCount: number): string {
  const year = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(3, "0");
  return `TR-${year}-${sequence}`;
}

/** Format currency value */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Format date for display */
export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Get status badge color */
export function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** Get recommendation status label */
export function getRecommendationLabel(status: string | null): string {
  switch (status) {
    case "proceed":
      return "Proceed";
    case "additional_trials":
      return "Additional Trials Needed";
    case "discontinue":
      return "Discontinue";
    default:
      return "—";
  }
}

/** Format status for display */
export function formatStatus(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

/** Calculate total from cost items */
export function calculateTotal(
  costs: { estimated_cost: number | null; actual_cost: number | null }[],
  field: "estimated_cost" | "actual_cost"
): number {
  return costs.reduce((sum, cost) => sum + (cost[field] || 0), 0);
}
