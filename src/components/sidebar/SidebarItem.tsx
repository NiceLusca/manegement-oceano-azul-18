
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
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
  const menuTitle = title.toUpperCase();

  if (!subitems) {
    return (
      <li className="mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-all duration-200",
                  isActive
                    ? "bg-[#1e2131] text-[#38a9e4] font-medium" 
                    : "text-white/80 hover:bg-[#171923] hover:text-white",
                  collapsed && "justify-center p-2.5"
                )
              }
            >
              <span className={cn(
                "transition-all duration-200", 
                isActive ? "text-[#38a9e4]" : "text-white/70"
              )}>
                {icon}
              </span>
              <span className={cn(
                "whitespace-nowrap transition-all duration-200 uppercase font-bold", 
                collapsed && "hidden"
              )}>
                {menuTitle}
              </span>
            </NavLink>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="font-medium bg-[#0f1117] border-[#202330]">
              {menuTitle}
            </TooltipContent>
          )}
        </Tooltip>
      </li>
    );
  }

  return (
    <li className="mb-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={href}
            className={({ isActive }) =>
              cn(
                "flex items-center w-full justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                isActive
                  ? "bg-[#1e2131] text-[#38a9e4] font-medium" 
                  : "text-white/80 hover:bg-[#171923] hover:text-white",
                collapsed && "justify-center p-2.5"
              )
            }
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "transition-all duration-200", 
                isActive ? "text-[#38a9e4]" : "text-white/70"
              )}>
                {icon}
              </span>
              <span className={cn(
                "whitespace-nowrap transition-all duration-200 uppercase font-bold", 
                collapsed && "hidden"
              )}>
                {menuTitle}
              </span>
            </div>
            {!collapsed && (
              <span className="text-white/70 transition-transform duration-200">
                <ChevronDown className="h-4 w-4" />
              </span>
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="font-medium bg-[#0f1117] border-[#202330]">
            {menuTitle}
          </TooltipContent>
        )}
      </Tooltip>
    </li>
  );
}
