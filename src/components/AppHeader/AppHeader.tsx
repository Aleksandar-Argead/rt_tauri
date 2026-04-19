import type { ReactNode } from "react";
import { Menu } from "lucide-react"; // Optional: fallback icon if you want custom styling

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { SidebarTrigger } from "@/components/ui/sidebar"; // Import from shadcn sidebar

export const AppHeader = ({
  title,
  breadcrumbs,
  actions,
}: {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: ReactNode;
}) => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* Left side: Sidebar Trigger + Breadcrumbs / Title */}
      <div className="flex items-center gap-2">
        {/* Mobile-friendly Sidebar Trigger (hamburger / collapse button) */}
        <SidebarTrigger className="md:hidden" />{" "}
        {/* Visible on mobile by default */}
        {/* Optional: Show trigger on desktop too if you want users to collapse the sidebar easily */}
        {/* <SidebarTrigger /> */}
        {/* Breadcrumbs or Title */}
        <div className="flex items-center gap-2">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <BreadcrumbItem key={index}>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                      {!isLast && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : title ? (
            <h1 className="font-semibold text-xl">{title}</h1>
          ) : null}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side: Custom actions (buttons, user menu, etc.) */}
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
};
