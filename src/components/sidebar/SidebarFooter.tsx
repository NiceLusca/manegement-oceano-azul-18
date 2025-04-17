
import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-sidebar-border/50 mt-auto bg-gradient-to-t from-sidebar-background/90 to-sidebar-background/70">
      {!collapsed ? (
        <div className="text-xs text-sidebar-foreground/70 space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="font-medium text-oceano-claro">Oceano Azul</span> 
            <span className="text-sidebar-foreground/50">•</span> 
            <span>v1.0.0</span>
          </p>
          <p className="text-sidebar-foreground/60">© 2025 Todos os direitos reservados</p>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Info className="h-4 w-4 text-sidebar-foreground/60 hover:text-oceano-claro transition-colors duration-200" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="text-xs">Oceano Azul • v1.0.0</p>
            <p className="text-xs">© 2025 Todos os direitos reservados</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
