
import * as React from 'react';
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

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-[#0a0c13] to-[#101322] text-white h-screen border-r border-[#202330]/50 transition-all duration-300 ease-in-out flex flex-col shadow-xl shadow-black/20",
        collapsed ? "w-20" : "w-64" 
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
