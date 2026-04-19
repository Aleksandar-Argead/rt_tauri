import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Trash2, ArrowRight, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useStore } from '@store/useStore';
import { AppHeader } from '@components/AppHeader';

export const Route = createFileRoute('/network')({
  component: NetworkPage,
});

function NetworkPage() {
  const { timeline, searchTerm, setSearchTerm, clearTimeline, selectedConnectionId, connections } = useStore();

  // Filter only network-related commands
  const networkCommands = useMemo(() => {
    return timeline
      .filter((item) => item.type === 'api.response' || item.type === 'api.request' || item.type.includes('api.'))
      .filter((item) => !selectedConnectionId || item.connectionId === selectedConnectionId)
      .sort((a, b) => b.timestamp - a.timestamp); // newest first
  }, [timeline, selectedConnectionId]);

  // Apply search filter
  const filteredNetwork = useMemo(() => {
    if (!searchTerm) return networkCommands;

    const term = searchTerm.toLowerCase();
    return networkCommands.filter((item) => {
      const payloadStr = JSON.stringify(item.payload ?? {}).toLowerCase();
      return item.type.toLowerCase().includes(term) || payloadStr.includes(term);
    });
  }, [networkCommands, searchTerm]);

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-emerald-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '—';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const extractUrl = (payload: any): string => {
    if (!payload) return 'Unknown';
    return payload.url || payload.endpoint || payload.request?.url || 'Unknown';
  };

  const extractMethod = (payload: any): string => {
    return payload.method || payload.request?.method || 'GET';
  };

  const extractStatus = (payload: any): number | undefined => {
    return payload.status || payload.response?.status;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader
        title="Network"
        actions={
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search URL, method or status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Button variant="destructive" size="sm" onClick={clearTimeline} className="flex items-center gap-2">
              <Trash2 size={16} />
              Clear All
            </Button>
          </div>
        }
      />

      <ScrollArea className="flex-1 p-4">
        {filteredNetwork.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6 opacity-20">🌐</div>
            <h3 className="text-xl font-medium text-muted-foreground">No network requests yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">Make API calls in your React Native app to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNetwork.map((item) => {
              const payload = item.payload || {};
              const url = extractUrl(payload);
              const method = extractMethod(payload);
              const status = extractStatus(payload);
              const duration = payload.duration || payload.time || undefined;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(status)} text-white font-mono`}>{status || '—'}</Badge>

                      <Badge variant="outline" className="font-mono">
                        {method}
                      </Badge>

                      <span className="text-sm font-medium truncate max-w-md">{url}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(duration)}
                      </span>
                      <span>{format(new Date(item.timestamp), 'HH:mm:ss.SSS')}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger className="w-full px-4 py-3 text-left hover:bg-muted/50 flex justify-between items-center border-b">
                        <span className="text-sm font-medium">Request & Response Details</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200" />
                      </CollapsibleTrigger>

                      <CollapsibleContent className="p-4 space-y-6">
                        {/* Request */}
                        {payload.request && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 text-emerald-600">Request</h4>
                            <pre className="bg-zinc-950 text-zinc-200 p-4 rounded text-xs overflow-auto">{JSON.stringify(payload.request, null, 2)}</pre>
                          </div>
                        )}

                        {/* Response */}
                        {payload.response && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 text-violet-600">Response</h4>
                            <pre className="bg-zinc-950 text-zinc-200 p-4 rounded text-xs overflow-auto">{JSON.stringify(payload.response, null, 2)}</pre>
                          </div>
                        )}

                        {/* Full Raw Payload */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Full Payload</h4>
                          <pre className="bg-zinc-950 text-zinc-200 p-4 rounded text-xs overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
