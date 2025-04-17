
import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-[#202330]/50 mt-auto bg-gradient-to-t from-[#0a0c13]/90 to-[#0a0c13]/70">
      {!collapsed ? (
        <div className="text-xs text-white/70 space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="font-medium text-[#38a9e4]">Oceano Azul</span> 
            <span className="text-white/30">•</span> 
            <span>v1.0.0</span>
          </p>
          <p className="text-white/50">© 2025 Todos os direitos reservados</p>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Info className="h-4 w-4 text-white/60 hover:text-[#38a9e4] transition-colors duration-200" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px] bg-[#0f1117] border-[#202330]">
            <p className="text-xs">Oceano Azul • v1.0.0</p>
            <p className="text-xs">© 2025 Todos os direitos reservados</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
