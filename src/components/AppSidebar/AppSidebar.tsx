import { Link } from '@tanstack/react-router';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenuButton, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import React, { useMemo } from 'react';
import { Activity, Building, Logs, Network } from 'lucide-react';
import { AppSidebarHeader } from './components';
import { useStore } from '@store/useStore';

export const AppSidebar = () => {
  const { connections, selectedConnectionId, setSelectedConnection } = useStore();

  const { state } = useSidebar();

  const isCollapsed = useMemo(() => state === 'collapsed', [state]);

  const sidebarItems = React.useMemo(
    () => [
      {
        title: 'Timeline',
        url: '/timeline',
        icon: Activity,
      },
      {
        title: 'State',
        url: '/state',
        icon: Building,
      },
      {
        title: 'Network',
        url: '/network',
        icon: Network,
      },
      {
        title: 'Logs',
        url: '/logs',
        icon: Logs,
      },
      {
        title: 'MMKV',
        url: '/mmkv',
        icon: Building,
      },
    ],
    []
  );

  return (
    <Sidebar collapsible="icon" defaultChecked>
      <AppSidebarHeader connections={connections} activeConnectionId={selectedConnectionId} setActiveConnectionId={setSelectedConnection} />
      <SidebarContent>
        <SidebarGroup className="gap-y-2">
          {sidebarItems.map((item, index) => (
            <Link key={`${index}-${item.url}`} to={item.url} className="cursor-pointer">
              <SidebarMenuButton className="cursor-pointer" tooltip={isCollapsed ? item.title : undefined}>
                {item.icon && <item.icon />}
                {!isCollapsed && item.title}
              </SidebarMenuButton>
            </Link>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
