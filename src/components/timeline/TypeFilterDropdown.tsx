import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const filterableTypes = ['log', 'warn', 'error', 'state.action.complete', 'state.action.dispatch', 'api.response', 'bench.report', 'display', 'image'] as const;

const typeColors: Record<string, string> = {
  'client.intro': 'bg-blue-500',
  'hello.client': 'bg-blue-500',
  log: 'bg-emerald-500',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
  'state.action.complete': 'bg-violet-500',
  'state.action.dispatch': 'bg-purple-500',
  'api.response': 'bg-cyan-500',
  'bench.report': 'bg-orange-500',
  display: 'bg-rose-500',
  image: 'bg-pink-500',
};

interface TypeFilterDropdownProps {
  filters: { types: string[] };
  onToggleType: (type: string) => void;
  onClearFilters: () => void;
}

export function TypeFilterDropdown({ filters, onToggleType, onClearFilters }: TypeFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onClearFilters} className="cursor-pointer">
          {filters.types.length === 0 ? '✓ All Types' : 'Clear All Filters'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {filterableTypes.map((type) => {
          const isSelected = filters.types.includes(type);
          return (
            <DropdownMenuCheckboxItem key={type} checked={isSelected} onCheckedChange={() => onToggleType(type)}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${typeColors[type] || 'bg-gray-500'}`} />
                {type}
              </div>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
