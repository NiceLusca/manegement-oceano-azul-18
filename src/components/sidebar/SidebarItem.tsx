
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-primary/30 to-primary/10 text-primary font-medium shadow-sm" 
                    : "hover:bg-sidebar-accent/20 text-sidebar-foreground/90 hover:text-sidebar-foreground",
                  collapsed && "justify-center p-2.5"
                )
              }
            >
              <span className={cn(
                "transition-all duration-200", 
                isActive ? "text-oceano-claro" : "text-sidebar-foreground/80"
              )}>
                {icon}
              </span>
              <span className={cn(
                "whitespace-nowrap transition-all duration-200", 
                collapsed && "hidden"
              )}>
                {title}
              </span>
            </NavLink>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="font-medium">
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
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-primary/30 to-primary/10 text-primary font-medium shadow-sm"
                : "hover:bg-sidebar-accent/20 text-sidebar-foreground/90 hover:text-sidebar-foreground",
              collapsed && "justify-center p-2.5"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "transition-all duration-200", 
                isActive ? "text-oceano-claro" : "text-sidebar-foreground/80"
              )}>
                {icon}
              </span>
              <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                {title}
              </span>
            </div>
            {!collapsed && subitems && (
              <span className="text-sidebar-foreground/70 transition-transform duration-200" style={{
                transform: expandedSection === title ? 'rotate(0deg)' : 'rotate(-90deg)'
              }}>
                <ChevronDown className="h-4 w-4" />
              </span>
            )}
          </button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="font-medium">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
      
      {subitems && !collapsed && (
        <ul className={cn(
          "mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
          expandedSection === title 
            ? "max-h-[500px] opacity-100" 
            : "max-h-0 opacity-0"
        )}>
          {subitems.map((subitem) => (
            <li key={subitem.title}>
              <NavLink
                to={subitem.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 ml-7 px-3 py-2 rounded-md transition-all duration-200 text-sm",
                    isActive
                      ? "bg-sidebar-primary/10 text-oceano-claro font-medium"
                      : "hover:bg-sidebar-accent/10 text-sidebar-foreground/80 hover:text-sidebar-foreground/90"
                  )
                }
              >
                <span className="text-sidebar-foreground/70">
                  {subitem.icon}
                </span>
                <span>{subitem.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
