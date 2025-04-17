
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ReactNode;
  collapsed: boolean;
  isActive: boolean;
}

export function SidebarItem({
  title,
  href,
  icon,
  collapsed,
  isActive,
}: SidebarItemProps) {
  React.useEffect(() => {
    console.log(`SidebarItem ${title} - isActive: ${isActive}`);
  }, [title, isActive]);

  return (
    <li className="w-full px-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className={cn(
              "flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200",
              isActive
                ? "bg-[#1e40af] text-white font-medium" 
                : "text-white/80 hover:bg-[#171923] hover:text-white",
              collapsed && "justify-center px-3"
            )}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="flex items-center justify-center">
                {icon}
              </span>
              
              {!collapsed && (
                <span className="whitespace-nowrap font-medium">
                  {title}
                </span>
              )}
            </div>
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="font-medium bg-[#0f1117] border-[#202330]">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
    </li>
  );
}
