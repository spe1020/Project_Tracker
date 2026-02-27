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

/** Format file size to human-readable string */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Get human-readable label for a MIME type */
export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType === "application/pdf") return "PDF";
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  )
    return "Spreadsheet";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "Document";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "Presentation";
  if (mimeType.startsWith("text/")) return "Text";
  return "File";
}

/** Calculate total from cost items */
export function calculateTotal(
  costs: { estimated_cost: number | null; actual_cost: number | null }[],
  field: "estimated_cost" | "actual_cost"
): number {
  return costs.reduce((sum, cost) => sum + (cost[field] || 0), 0);
}

// --- Project utilities ---

/** Generate project number in format PIG-YYYY-### */
export function generateProjectNumber(existingCount: number): string {
  const year = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(3, "0");
  return `PIG-${year}-${sequence}`;
}

/** Get project status badge color */
export function getProjectStatusColor(status: string): string {
  switch (status) {
    case "planning":
      return "bg-purple-100 text-purple-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "on_hold":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** Get step status badge color */
export function getStepStatusColor(status: string): string {
  switch (status) {
    case "not_started":
      return "bg-gray-100 text-gray-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "delayed":
      return "bg-yellow-100 text-yellow-800";
    case "blocked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** Format project status for display */
export function formatProjectStatus(status: string): string {
  switch (status) {
    case "planning":
      return "Planning";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

/** Format step status for display */
export function formatStepStatus(status: string): string {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "delayed":
      return "Delayed";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}
