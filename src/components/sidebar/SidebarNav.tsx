
import React from 'react';
import {
  Calendar,
  Settings,
  Users,
  LayoutDashboard,
  CheckSquare,
  UserSquare2,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { useLocation } from 'react-router-dom';

interface SidebarNavProps {
  collapsed: boolean;
  expandedSection: string | null;
  toggleSection: (title: string) => void;
}

interface SidebarItemType {
  title: string;
  href: string;
  icon: React.ReactNode;
  exactMatch?: boolean;
}

export function SidebarNav({ collapsed, expandedSection, toggleSection }: SidebarNavProps) {
  const location = useLocation();
  
  const items: SidebarItemType[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      exactMatch: true,
    },
    { 
      title: 'Tarefas', 
      href: '/projects', 
      icon: <CheckSquare className="h-5 w-5" />,
    },
    { 
      title: 'Equipe', 
      href: '/team', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      title: 'Clientes', 
      href: '/customers', 
      icon: <UserSquare2 className="h-5 w-5" /> 
    },
    { 
      title: 'Calendário', 
      href: '/calendar', 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      title: 'Configurações', 
      href: '/settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];

  return (
    <nav className="p-3 flex-1 overflow-y-auto">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isExactMatch = location.pathname === item.href;
          const isDashboardActive = item.href === "/" && location.pathname === "/";
          const isPartialMatch = !isExactMatch && 
            item.href !== "/" && 
            location.pathname.startsWith(item.href);
          
          const isActive = Boolean(
            isExactMatch || 
            isDashboardActive || 
            (isPartialMatch && !item.exactMatch)
          );
          
          return (
            <SidebarItem
              key={item.title}
              title={item.title}
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              collapsed={collapsed}
              expandedSection={expandedSection}
              toggleSection={toggleSection}
            />
          );
        })}
      </ul>
    </nav>
  );
}
