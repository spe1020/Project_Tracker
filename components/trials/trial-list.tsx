"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Trial } from "@/lib/types";
import {
  formatDate,
  formatCurrency,
  formatStatus,
  getStatusColor,
} from "@/lib/utils";

interface TrialListProps {
  trials: Trial[];
}

type SortField = "date" | "trial_number" | "department" | "estimated_total_cost";

export function TrialList({ trials }: TrialListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredTrials = useMemo(() => {
    let result = [...trials];

    // Search
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.trial_number.toLowerCase().includes(query) ||
          (t.department && t.department.toLowerCase().includes(query)) ||
          (t.lead_name && t.lead_name.toLowerCase().includes(query)) ||
          (t.product_process && t.product_process.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "date":
          aVal = a.date || "";
          bVal = b.date || "";
          break;
        case "trial_number":
          aVal = a.trial_number;
          bVal = b.trial_number;
          break;
        case "department":
          aVal = a.department || "";
          bVal = b.department || "";
          break;
        case "estimated_total_cost":
          aVal = a.estimated_total_cost || 0;
          bVal = b.estimated_total_cost || 0;
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [trials, search, statusFilter, sortField, sortOrder]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredTrials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {trials.length === 0
              ? "No trials yet. Create your first trial to get started."
              : "No trials match your search criteria."}
          </p>
          {trials.length === 0 && (
            <Link href="/trials/new" className="mt-4 inline-block">
              <Button>Create First Trial</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3"
                    onClick={() => toggleSort("trial_number")}
                  >
                    Trial # <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3"
                    onClick={() => toggleSort("date")}
                  >
                    Date <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3"
                    onClick={() => toggleSort("department")}
                  >
                    Department <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Lead</TableHead>
                <TableHead className="hidden lg:table-cell">Product/Process</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-3"
                    onClick={() => toggleSort("estimated_total_cost")}
                  >
                    Est. Cost <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrials.map((trial) => (
                <TableRow key={trial.id}>
                  <TableCell>
                    <Link
                      href={`/trials/view?id=${trial.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {trial.trial_number}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(trial.date)}</TableCell>
                  <TableCell>{trial.department || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {trial.lead_name || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {trial.product_process || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(trial.status)}
                      variant="secondary"
                    >
                      {formatStatus(trial.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trial.estimated_total_cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Showing {filteredTrials.length} of {trials.length} trials
      </p>
    </div>
  );
}
