
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
  expandedSection: string | null;
  toggleSection: (title: string) => void;
}

export function SidebarItem({
  title,
  href,
  icon,
  isActive,
  collapsed,
  expandedSection,
  toggleSection,
}: SidebarItemProps) {
  const menuTitle = title.toUpperCase();

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={href}
            className={({ isActive }) =>
              cn(
                "flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-[#1e2131] text-[#38a9e4] font-medium" 
                  : "text-white/80 hover:bg-[#171923] hover:text-white",
                collapsed && "justify-center p-2.5"
              )
            }
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "flex items-center justify-center transition-all duration-200", 
                isActive ? "text-[#38a9e4]" : "text-white/70"
              )}>
                {icon}
              </span>
              
              {!collapsed && (
                <span className="whitespace-nowrap transition-all duration-200 uppercase font-bold">
                  {menuTitle}
                </span>
              )}
            </div>
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
