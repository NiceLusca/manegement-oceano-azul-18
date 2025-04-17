
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Settings,
  Users,
  LayoutDashboard,
  CheckSquare,
  UserSquare2,
  ClipboardList,
  BarChart3,
  History,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

interface SidebarNavProps {
  collapsed: boolean;
  expandedSection: string | null;
  toggleSection: (title: string) => void;
}

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  subitems?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export function SidebarNav({ collapsed, expandedSection, toggleSection }: SidebarNavProps) {
  const location = useLocation();
  
  const items: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Tarefas",
      href: "/projects",
      icon: <CheckSquare className="h-5 w-5" />,
      subitems: [
        {
          title: "Quadro Kanban",
          href: "/projects",
          icon: <ClipboardList className="h-4 w-4" />
        },
        {
          title: "Tarefas Recorrentes",
          href: "/recurring-tasks",
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          title: "Histórico de Atividades",
          href: "/activity-history",
          icon: <History className="h-4 w-4" />
        },
      ],
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
      <ul className="space-y-1.5">
        {items.map((item) => {
          // Verificar se o item ou um de seus subitens está ativo
          const isItemActive = location.pathname === item.href || 
            (item.subitems?.some(subitem => location.pathname === subitem.href));
          
          return (
            <SidebarItem
              key={item.title}
              title={item.title}
              href={item.href}
              icon={item.icon}
              isActive={isItemActive}
              collapsed={collapsed}
              expandedSection={expandedSection}
              toggleSection={toggleSection}
              subitems={item.subitems}
            />
          );
        })}
      </ul>
    </nav>
  );
}
