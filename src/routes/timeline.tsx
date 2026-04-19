import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useStore } from '@store/useStore';
import { AppHeader } from '@components/AppHeader';
import { Field } from '@components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@components/ui/input-group';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TimelineEventRow, TypeFilterDropdown } from '@components/timeline';

export const Route = createFileRoute('/timeline')({
  component: TimelinePage,
});

function TimelinePage() {
  const { timeline, clearTimeline, selectedConnectionId, connections } = useStore();

  const [filters, setFilters] = useState<{ types: string[] }>({ types: [] });
  const [searchTerm, setSearchTerm] = useState('');

  const parentRef = useRef<HTMLDivElement>(null);

  const filteredTimeline = useMemo(() => {
    const currentTimeline = selectedConnectionId ? timeline[selectedConnectionId] || [] : Object.values(timeline).flat();

    const filtered = currentTimeline.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(item.payload ?? {})
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType = filters.types.length === 0 || filters.types.includes(item.type);

      return matchesSearch && matchesType;
    });

    // Newest events first
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  }, [timeline, selectedConnectionId, searchTerm, filters.types]);

  const toggleTypeFilter = (type: string) => {
    setFilters((prev) => ({
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
  };

  const clearFilters = () => setFilters({ types: [] });

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: filteredTimeline.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // ← Important: Adjust this to your average TimelineEventCard height
    overscan: 8, // Render a few extra items for smooth scrolling
    // Optional: enable dynamic measurement (more accurate but slightly heavier)
    // measureElement: (element) => element?.getBoundingClientRect().height ?? 140,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Optional: Scroll to top when filters/search change significantly
  useEffect(() => {
    virtualizer.scrollToIndex(0, { align: 'start', behavior: 'auto' });
  }, [searchTerm, filters.types, virtualizer]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader
        title="Timeline"
        actions={
          <div className="flex items-center gap-3">
            <TypeFilterDropdown filters={filters} onToggleType={toggleTypeFilter} onClearFilters={clearFilters} />
            <Field>
              <InputGroup>
                <InputGroupInput placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <InputGroupAddon>
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Button variant="destructive" size="sm" onClick={clearTimeline} className="flex items-center gap-2">
              <Trash2 size={16} />
              Clear All
            </Button>
          </div>
        }
      />

      <ScrollArea className="flex-1 p-4" ref={parentRef}>
        {filteredTimeline.length === 0 ? (
          <div className="flex h-100 flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6 opacity-20">📭</div>
            <h3 className="text-xl font-medium text-muted-foreground">No matching events</h3>
            <p className="text-sm text-muted-foreground mt-2">{searchTerm || filters.types.length > 0 ? 'Try adjusting your search or type filter' : 'Connect your React Native app to see events in real-time'}</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const event = filteredTimeline[virtualItem.index];

              return (
                <div
                  key={event.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`, // we'll make this dynamic next
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <TimelineEventRow item={event} connections={connections} />
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
