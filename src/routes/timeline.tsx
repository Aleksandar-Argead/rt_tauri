import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Search, Trash2, Filter } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useStore } from "@store/useStore";
import { AppHeader } from "@components/AppHeader";
import { Field } from "@components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

const typeColors: Record<string, string> = {
  "client.intro": "bg-blue-500",
  "hello.client": "bg-blue-500",
  log: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-red-500",
  "state.action.complete": "bg-violet-500",
  "state.action.dispatch": "bg-purple-500",
  "api.response": "bg-cyan-500",
  "bench.report": "bg-orange-500",
  display: "bg-rose-500",
  image: "bg-pink-500",
};

// All filterable types
const filterableTypes: CommandType[] = [
  "log",
  "warn",
  "error",
  "state.action.complete",
  "state.action.dispatch",
  "api.response",
  "bench.report",
  "display",
  "image",
];

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const {
    timeline,
    searchTerm,
    clearTimeline,
    selectedConnectionId,
    connections,
    filters,
    toggleTypeFilter,
  } = useStore();

  // Base timeline (respect selected connection)
  const baseTimeline = selectedConnectionId
    ? timeline.filter((item) => item.connectionId === selectedConnectionId)
    : timeline;

  // Apply search + type filter
  const filteredTimeline = baseTimeline.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(item.payload ?? {})
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType =
      filters.types.length === 0 || filters.types.includes(item.type);

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string): string => {
    return typeColors[type] || "bg-gray-500";
  };

  const formatPayload = (payload: any): string => {
    if (!payload) return "—";
    const str =
      typeof payload === "object"
        ? JSON.stringify(payload, null, 2)
        : String(payload);
    return str.length > 150 ? str.slice(0, 147) + "..." : str;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader
        title="Timeline"
        actions={
          <div className="flex items-center gap-3">
            {/* Type Filter Dropdown */}
            {/* Type Filter Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuGroup>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Select All / Clear */}
                  <DropdownMenuItem
                    onClick={() => {
                      // Clear all current filters
                      filters.types.forEach((type) => toggleTypeFilter(type));
                    }}
                    className="cursor-pointer"
                  >
                    {filters.types.length === 0
                      ? "✓ All Types"
                      : "Clear All Filters"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Individual Type Filters */}
                  {filterableTypes.map((type) => {
                    const isSelected = filters.types.includes(type);
                    return (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={isSelected}
                        onCheckedChange={() => toggleTypeFilter(type)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${typeColors[type] || "bg-gray-500"}`}
                          />
                          {type}
                        </div>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenuGroup>
            </DropdownMenu>

            {/* Search Input */}
            <Field>
              <InputGroup>
                <InputGroupInput
                  id="input-group-url"
                  placeholder="example.com"
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </Field>

            {/* Clear Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={clearTimeline}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear All
            </Button>
          </div>
        }
      />

      {/* Timeline List */}
      <ScrollArea className="flex-1 p-4">
        {filteredTimeline.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6 opacity-20">📭</div>
            <h3 className="text-xl font-medium text-muted-foreground">
              No matching events
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm || filters.types.length > 0
                ? "Try adjusting your search or type filter"
                : "Connect your React Native app to see events in real-time"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTimeline.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getTypeColor(item.type)} text-white`}>
                      {item.type}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {format(new Date(item.timestamp), "HH:mm:ss.SSS")}
                    </span>
                  </div>

                  {connections[item.connectionId] && (
                    <span className="text-xs text-muted-foreground">
                      {connections[item.connectionId].name ||
                        connections[item.connectionId].address}
                    </span>
                  )}
                </CardHeader>

                <CardContent className="p-4">
                  <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto font-mono whitespace-pre-wrap break-words">
                    {formatPayload(item.payload)}
                  </pre>

                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      View full raw message
                    </summary>
                    <pre className="mt-2 text-xs bg-zinc-950 text-zinc-200 p-4 rounded overflow-auto">
                      {JSON.stringify(item.raw || item.payload, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
