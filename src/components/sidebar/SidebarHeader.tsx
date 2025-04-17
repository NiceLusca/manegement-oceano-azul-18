
import React from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export function SidebarHeader({ collapsed, toggleSidebar }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 h-16 border-b border-[#202330]/70 bg-gradient-to-b from-[#0a0c13] to-[#0a0c13]/95">
      {!collapsed && (
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
            alt="Oceano Azul" 
            className="h-8 w-auto transition-all duration-300 hover:scale-105" 
          />
          <h1 className="font-bold text-xl whitespace-nowrap text-[#38a9e4] tracking-tight">
            Oceano Azul
          </h1>
        </div>
      )}
      {collapsed && (
        <img 
          src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
          alt="Oceano Azul" 
          className="h-8 w-auto mx-auto transition-all duration-300 hover:scale-105" 
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#202330]/50 transition-all duration-200"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        <PanelLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
      </Button>
    </div>
  );
}
