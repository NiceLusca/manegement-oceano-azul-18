
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ReactNode;
  collapsed: boolean;
}

export function SidebarItem({
  title,
  href,
  icon,
  collapsed,
}: SidebarItemProps) {
  const menuTitle = title.toUpperCase();
  
  return (
    <li className="w-full px-1 mb-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={href}
            className={({ isActive }) => {
              return cn(
                "flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-[#1e40af] text-white font-medium" 
                  : "text-white/80 hover:bg-[#171923] hover:text-white",
                collapsed && "justify-center px-3 py-3"
              );
            }}
            end={href === "/"}
          >
            <div className="flex items-center gap-3 w-full">
              <span className={cn(
                "flex items-center justify-center transition-colors duration-200",
              )}>
                {icon}
              </span>
              
              {!collapsed && (
                <span className="whitespace-nowrap">
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
