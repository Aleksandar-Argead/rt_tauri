import { format } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReactotronCommand } from '@store/useStore';

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

interface TimelineEventRowProps {
  item: ReactotronCommand;
  connections: Record<string, any>;
}

export function TimelineEventRow({ item, connections }: TimelineEventRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type: string) => typeColors[type] || 'bg-gray-500';

  const connectionName = connections[item.connectionId] ? connections[item.connectionId].name || connections[item.connectionId].address : '—';

  // Compact preview (first line or truncated)
  const preview = item.payload ? (typeof item.payload === 'object' ? JSON.stringify(item.payload).slice(0, 120) + (JSON.stringify(item.payload).length > 120 ? '...' : '') : String(item.payload).slice(0, 120)) : '—';

  return (
    <>
      {/* Main Row - Always Visible */}
      <div className="group flex items-center gap-4 px-4 py-2.5 border-b hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Button>

        <div className="w-40 font-mono text-xs text-muted-foreground shrink-0">{format(new Date(item.timestamp), 'HH:mm:ss.SSS')}</div>

        <Badge className={`${getTypeColor(item.type)} text-white shrink-0`}>{item.type}</Badge>

        <div className="text-xs text-muted-foreground shrink-0 w-48 truncate">{connectionName}</div>

        <div className="flex-1 text-sm text-foreground truncate pr-4">{preview}</div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-zinc-950 border-b px-4 py-4 text-xs">
          <div className="mb-3">
            <div className="text-muted-foreground mb-1 text-[10px] uppercase tracking-widest">Full Payload</div>
            <pre className="bg-zinc-900 p-4 rounded overflow-auto font-mono whitespace-pre-wrap max-h-96 text-zinc-200">{JSON.stringify(item.payload ?? {}, null, 2)}</pre>
          </div>

          {item.raw && item.raw !== item.payload && (
            <div>
              <div className="text-muted-foreground mb-1 text-[10px] uppercase tracking-widest">Raw Message</div>
              <pre className="bg-zinc-900 p-4 rounded overflow-auto font-mono whitespace-pre-wrap max-h-96 text-zinc-200">{JSON.stringify(item.raw, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </>
  );
}
