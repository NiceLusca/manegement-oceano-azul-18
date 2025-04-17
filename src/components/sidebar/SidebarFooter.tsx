
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-sidebar-border mt-auto">
      {!collapsed && (
        <div className="text-xs text-sidebar-foreground/60">
          <p>Oceano Azul • v1.0.0</p>
          <p>© 2025 Todos os direitos reservados</p>
        </div>
      )}
    </div>
  );
}
