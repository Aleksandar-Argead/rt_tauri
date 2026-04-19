import * as React from 'react';
import { Apple, Bot, ChevronsUpDown, Globe, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@components/ui/sidebar';
import { Connection } from '@store/useStore';

export const AppSidebarHeader = ({ connections, setActiveConnectionId, activeConnectionId }: { connections: Record<string, Connection>; activeConnectionId: string | null; setActiveConnectionId: (id: string) => void }) => {
  const connectionEntries = React.useMemo(() => Object.entries(connections), [connections]);

  const activeConnection = React.useMemo(() => (activeConnectionId ? connections[activeConnectionId] : null), [activeConnectionId, connections]);

  if (!connectionEntries.length) {
    return null;
  }

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <SidebarMenuButton size="lg" className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                {activeConnection ? (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {String(activeConnection.platform).toLocaleLowerCase().trim() === 'ios' && <Apple className="size-4" />}
                      {activeConnection.platform === 'android' && <Bot className="size-4" />}
                      {activeConnection.platform === 'web' && <Globe className="size-4" />}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{activeConnection?.name || 'No connection'}</span>
                      <span className="truncate text-xs capitalize">{activeConnection?.platform || 'Unknown'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                      <div className="size-4 rounded-sm bg-muted-foreground/50" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">No connections</span>
                      <span className="truncate text-xs">Select a connection</span>
                    </div>
                  </>
                )}
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="start" sideOffset={4}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Connections</DropdownMenuLabel>
                {connectionEntries.map(([id, connection], index) => (
                  <DropdownMenuItem key={id} onClick={() => setActiveConnectionId(id)} className="gap-2 p-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {connection.platform === 'ios' && <Apple className="size-4" />}
                      {connection.platform === 'android' && <Bot className="size-4" />}
                      {connection.platform === 'web' && <Globe className="size-4" />}
                    </div>
                    <span className="truncate">{connection.name}</span>
                    <span className="text-xs text-muted-foreground capitalize truncate">{connection.platform}</span>
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Connect device</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
