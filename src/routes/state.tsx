import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { useStore } from '@store/useStore';
import { AppHeader } from '@components/AppHeader';

export const Route = createFileRoute('/state')({
  component: StatePage,
});

function StatePage() {
  const { timeline, selectedConnectionId } = useStore();

  // Filter only state-related commands for this page
  const stateCommands = useMemo(() => {
    return timeline
      .filter((item) => item.type === 'state.action.complete' || item.type === 'state.values.change' || item.type === 'state.values.response')
      .filter((item) => !selectedConnectionId || item.connectionId === selectedConnectionId)
      .sort((a, b) => a.timestamp - b.timestamp); // oldest first for history
  }, [timeline, selectedConnectionId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Current state at selected point in history
  const currentState = useMemo(() => {
    if (stateCommands.length === 0) return null;

    const relevantCommands = stateCommands.slice(0, currentIndex + 1);

    // For MVP: we'll simulate building state by taking the latest "state.values.response"
    // In real implementation, you'll merge diffs properly
    const latestStateResponse = [...relevantCommands].reverse().find((cmd) => cmd.type === 'state.values.response');

    if (latestStateResponse?.payload?.state) {
      return latestStateResponse.payload.state;
    }

    // Fallback: show latest action if no full state
    const latestAction = [...relevantCommands].reverse().find((cmd) => cmd.type === 'state.action.complete');

    return latestAction?.payload || {};
  }, [stateCommands, currentIndex]);

  const currentCommand = stateCommands[currentIndex];

  // Auto-play functionality
  // (You can remove or improve this later)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && currentIndex < stateCommands.length - 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 800);
    } else if (currentIndex >= stateCommands.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentIndex, stateCommands.length]);

  if (stateCommands.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <AppHeader title="State" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6 opacity-20">📊</div>
            <h3 className="text-xl font-medium">No state history yet</h3>
            <p className="text-muted-foreground mt-2">Perform actions in your app with Redux / MST to see state changes here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader title="State Inspector" />

      <div className="flex flex-1 flex-col overflow-hidden p-4 gap-4">
        {/* History Slider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              State History
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setCurrentIndex(0)} disabled={currentIndex === 0}>
                  <SkipBack size={16} />
                </Button>

                <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setCurrentIndex(stateCommands.length - 1)} disabled={currentIndex === stateCommands.length - 1}>
                  <SkipForward size={16} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-1">
              <Slider
                value={[currentIndex]}
                max={stateCommands.length - 1}
                step={1}
                onValueChange={(value) => {
                  setCurrentIndex(value[0]);
                  setIsPlaying(false); // pause when manually dragging
                }}
                className="w-full"
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>0</span>
              <span>
                {currentIndex + 1} / {stateCommands.length}
              </span>
            </div>

            {currentCommand && (
              <div className="text-sm">
                <Badge variant="secondary">{currentCommand.type}</Badge>
                <span className="ml-3 text-muted-foreground">{format(new Date(currentCommand.timestamp), 'HH:mm:ss.SSS')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current State Viewer */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Current State at this point</CardTitle>
            <p className="text-sm text-muted-foreground">Reconstructed state after {currentIndex + 1} events</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <pre className="text-sm bg-zinc-950 text-zinc-100 p-6 rounded-lg overflow-auto font-mono whitespace-pre-wrap break-all">{JSON.stringify(currentState, null, 2)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
