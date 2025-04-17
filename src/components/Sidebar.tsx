
import * as React from 'react';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar/SidebarNav';
import { useLocation } from 'react-router-dom';

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  
  React.useEffect(() => {
    console.log("Current path in Sidebar:", location.pathname);
  }, [location.pathname]);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={cn(
        "bg-[#0a0c13] text-white h-screen border-r border-[#202330]/50 transition-all duration-300 ease-in-out flex flex-col shadow-xl shadow-black/20 relative z-10",
        collapsed ? "w-20" : "w-64" 
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-[#202330]/70 bg-gradient-to-b from-[#0a0c13] to-[#0a0c13]/95">
        {!collapsed && (
          <div className="flex items-center gap-3">
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
      
      {/* Navigation */}
      <SidebarNav collapsed={collapsed} />
      
      {/* Footer */}
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
          <div className="flex justify-center">
            <span className="text-xs text-white/50">v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
