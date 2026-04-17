import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import React, { useMemo } from "react";
import { Activity } from "lucide-react";

export const AppSidebar = () => {
  const navigate = useNavigate();

  const { state } = useSidebar();

  const isCollapsed = useMemo(() => state === "collapsed", [state]);

  // const sidebarItems = React.useMemo(
  //   () => [
  //     {
  //       title: "Timeline",
  //       url: "/timeline",
  //       icon: <Building />,
  //     },
  //   ],
  //   [],
  // );

  const sidebarItems = [
    {
      title: "Timeline",
      url: "/timeline",
      icon: Activity,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        {sidebarItems.map((item, index) => (
          <Link to={item.url} className="flex gap-x-2 cursor-pointer">
            <SidebarMenuButton
              className="h-12 cursor-pointer"
              tooltip={isCollapsed ? item.title : undefined}
            >
              {item.icon && <item.icon size={24} />}
              {!isCollapsed && item.title}
            </SidebarMenuButton>
          </Link>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
