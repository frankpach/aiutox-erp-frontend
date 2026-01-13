/**
 * Task Filters Component
 * Filters for task list
 */

import { useTranslation } from "~/lib/i18n/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  SearchIcon,
  DownloadIcon,
  UploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type {
  TaskStatus,
  TaskPriority,
} from "~/features/tasks/types/task.types";

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onReset: () => void;
}

export function TaskFilters({ filters, onChange, onReset }: TaskFiltersProps) {
  useTranslation();

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof TaskFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="outline" className="text-xs">
                {
                  Object.keys(filters).filter(
                    (key) => filters[key as keyof TaskFilters]
                  ).length
                }{" "}
                active
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onReset}>
              <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <HugeiconsIcon
              icon={SearchIcon}
              size={16}
              className="absolute left-3 top-1/2 text-gray-400"
            />
            <Input
              placeholder="Search tasks..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
            {filters.search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearFilter("search")}
                className="absolute right-1 top-1/2"
              >
                <HugeiconsIcon
                  icon={DownloadIcon}
                  size={12}
                  className="absolute right-1 top-1/2"
                />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) =>
              updateFilter("status", value || undefined)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          {filters.status && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearFilter("status")}
              className="ml-2"
            >
              <HugeiconsIcon icon={DownloadIcon} size={12} className="ml-2" />
            </Button>
          )}
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <Select
            value={filters.priority || ""}
            onValueChange={(value) =>
              updateFilter("priority", value || undefined)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {filters.priority && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearFilter("priority")}
              className="ml-2"
            >
              <HugeiconsIcon icon={DownloadIcon} size={12} className="ml-2" />
            </Button>
          )}
        </div>

        <Separator />

        {/* Assigned To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <div className="relative">
            <HugeiconsIcon
              icon={UploadIcon}
              size={16}
              className="absolute left-3 top-1/2 text-gray-400"
            />
            <Input
              placeholder="Filter by assignee ID..."
              value={filters.assigned_to_id || ""}
              onChange={(e) => updateFilter("assigned_to_id", e.target.value)}
              className="pl-10"
            />
            {filters.assigned_to_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearFilter("assigned_to_id")}
                className="absolute right-1 top-1/2"
              >
                <HugeiconsIcon
                  icon={DownloadIcon}
                  size={12}
                  className="absolute right-1 top-1/2"
                />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Due Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <div className="relative">
                <HugeiconsIcon
                  icon={DownloadIcon}
                  size={16}
                  className="absolute left-3 top-1/2 text-gray-400"
                />
                <Input
                  type="date"
                  value={filters.due_date_from || ""}
                  onChange={(e) =>
                    updateFilter("due_date_from", e.target.value)
                  }
                  className="pl-10"
                />
                {filters.due_date_from && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearFilter("due_date_from")}
                    className="absolute right-1 top-1/2"
                  >
                    <HugeiconsIcon
                      icon={DownloadIcon}
                      size={12}
                      className="absolute right-1 top-1/2"
                    />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <div className="relative">
                <HugeiconsIcon
                  icon={DownloadIcon}
                  size={16}
                  className="absolute left-3 top-1/2 text-gray-400"
                />
                <Input
                  type="date"
                  value={filters.due_date_to || ""}
                  onChange={(e) => updateFilter("due_date_to", e.target.value)}
                  className="pl-10"
                />
                {filters.due_date_to && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearFilter("due_date_to")}
                    className="absolute right-1 top-1/2"
                  >
                    <HugeiconsIcon
                      icon={DownloadIcon}
                      size={12}
                      className="absolute right-1 top-1/2"
                    />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HugeiconsIcon
                icon={UploadIcon}
                size={16}
                className="text-gray-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Search: "{filters.search}"
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className="text-xs">
                  Status: {filters.status}
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="outline" className="text-xs">
                  Priority: {filters.priority}
                </Badge>
              )}
              {filters.assigned_to_id && (
                <Badge variant="outline" className="text-xs">
                  Assigned: {filters.assigned_to_id}
                </Badge>
              )}
              {filters.due_date_from && (
                <Badge variant="outline" className="text-xs">
                  From: {filters.due_date_from}
                </Badge>
              )}
              {filters.due_date_to && (
                <Badge variant="outline" className="text-xs">
                  To: {filters.due_date_to}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
