
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
    <li className="w-full px-1 mb-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={href}
            className={({ isActive: navActive }) => {
              // Combine our parent's isActive prop with NavLink's own isActive
              const itemIsActive = isActive || navActive;
              console.log(`NavLink ${title}: ${itemIsActive ? 'ACTIVE' : 'inactive'}`);
              
              return cn(
                "flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200",
                itemIsActive
                  ? "bg-[#38B2AC] text-white font-medium" 
                  : "text-white/80 hover:bg-[#171923] hover:text-white",
                collapsed && "justify-center px-3 py-3"
              );
            }}
            end={href === "/"}
          >
            <div className="flex items-center gap-3 w-full">
              <span className={cn(
                "flex items-center justify-center transition-all duration-200",
                isActive ? "text-white" : "text-white/70"
              )}>
                {icon}
              </span>
              
              {!collapsed && (
                <span className={cn(
                  "whitespace-nowrap transition-all duration-200",
                  isActive ? "text-white font-medium" : "text-white/70"
                )}>
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
