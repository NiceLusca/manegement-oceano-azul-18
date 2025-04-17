
import React from 'react';
import {
  Calendar,
  Settings,
  Users,
  LayoutDashboard,
  CheckSquare,
  UserSquare2,
  History,
  RepeatIcon,
  KanbanSquare,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

interface SidebarNavProps {
  collapsed: boolean;
  expandedSection: string | null;
  toggleSection: (title: string) => void;
}

// Define a proper interface for sidebar items and subitems
interface SidebarSubItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarItemType {
  title: string;
  href: string;
  icon: React.ReactNode;
  subitems?: SidebarSubItem[];
}

export function SidebarNav({ collapsed, expandedSection, toggleSection }: SidebarNavProps) {
  const items: SidebarItemType[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { 
      title: 'Tarefas', 
      href: '/projects', 
      icon: <CheckSquare className="h-5 w-5" />,
      subitems: [
        {
          title: 'Kanban',
          href: '/projects',
          icon: <KanbanSquare className="h-4 w-4" />
        },
        {
          title: 'Recorrentes',
          href: '/recurring-tasks',
          icon: <RepeatIcon className="h-4 w-4" />
        },
        {
          title: 'Histórico',
          href: '/activity-history',
          icon: <History className="h-4 w-4" />
        }
      ]
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
        {items.map((item) => (
          <SidebarItem
            key={item.title}
            title={item.title}
            href={item.href}
            icon={item.icon}
            isActive={false}
            collapsed={collapsed}
            expandedSection={expandedSection}
            toggleSection={toggleSection}
            subitems={item.subitems}
          />
        ))}
      </ul>
    </nav>
  );
}
