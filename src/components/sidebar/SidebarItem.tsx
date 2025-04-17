
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarSubItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
  expandedSection: string | null;
  toggleSection: (title: string) => void;
  subitems?: SidebarSubItem[];
}

export function SidebarItem({
  title,
  href,
  icon,
  isActive,
  collapsed,
  expandedSection,
  toggleSection,
  subitems
}: SidebarItemProps) {
  if (!subitems) {
    return (
      <li className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium" 
                    : "hover:bg-sidebar-accent/30 text-sidebar-foreground",
                  collapsed && "justify-center p-2"
                )
              }
            >
              {icon}
              <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                {title}
              </span>
            </NavLink>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              {title}
            </TooltipContent>
          )}
        </Tooltip>
      </li>
    );
  }

  return (
    <li className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => toggleSection(title)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors",
              isActive
                ? "bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium"
                : "hover:bg-sidebar-accent/30 text-sidebar-foreground",
              collapsed && "justify-center p-2"
            )}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                {title}
              </span>
            </div>
            {!collapsed && subitems && (
              expandedSection === title ? 
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/70" /> :
                <ChevronRight className="h-4 w-4 text-sidebar-foreground/70" />
            )}
          </button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
      
      {subitems && !collapsed && (
        <ul className={cn(
          "mt-1 space-y-1 overflow-hidden transition-all duration-300",
          expandedSection === title ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}>
          {subitems.map((subitem) => (
            <li key={subitem.title}>
              <NavLink
                to={subitem.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 ml-6 px-3 py-2 rounded-md transition-colors text-sm",
                    isActive
                      ? "bg-sidebar-primary/20 text-sidebar-primary font-medium"
                      : "hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground"
                  )
                }
              >
                {subitem.icon}
                <span>{subitem.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
