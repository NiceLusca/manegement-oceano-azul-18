
import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNav } from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  const location = useLocation();
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  // Verificar qual seção deve estar expandida com base na rota atual
  React.useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if current path is a subitem of Tarefas
    if (["/projects", "/recurring-tasks", "/activity-history"].includes(currentPath)) {
      setExpandedSection("Tarefas");
    }
  }, [location.pathname]);

  return (
    <aside
      className={cn(
        "bg-sidebar-background text-sidebar-foreground h-screen border-r border-sidebar-border/40 transition-all duration-300 ease-in-out flex flex-col shadow-lg shadow-black/10",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarHeader 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
      />
      
      <SidebarNav
        collapsed={collapsed}
        expandedSection={expandedSection}
        toggleSection={toggleSection}
      />
      
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
