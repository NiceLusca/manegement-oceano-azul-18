
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
    <div className="flex items-center justify-between p-4 h-14 border-b border-sidebar-border">
      {!collapsed && (
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
            alt="Oceano Azul" 
            className="h-8 w-auto" 
          />
          <h1 className="font-bold text-xl whitespace-nowrap text-oceano-claro">
            Oceano Azul
          </h1>
        </div>
      )}
      {collapsed && (
        <img 
          src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
          alt="Oceano Azul" 
          className="h-8 w-auto mx-auto" 
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent/30"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
