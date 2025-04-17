
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Settings,
  Users,
  LayoutDashboard,
  CheckSquare,
  UserSquare2,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log("Current path in SidebarNav:", location.pathname);
  }, [location.pathname]);
  
  const items = [
    {
      title: "DASHBOARD",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      match: (path: string) => path === '/',
    },
    { 
      title: 'TAREFAS', 
      href: '/projects', 
      icon: <CheckSquare className="h-5 w-5" />,
      match: (path: string) => path.startsWith('/projects'),
    },
    { 
      title: 'EQUIPE', 
      href: '/team', 
      icon: <Users className="h-5 w-5" />,
      match: (path: string) => path.startsWith('/team'),
    },
    { 
      title: 'CLIENTES', 
      href: '/customers', 
      icon: <UserSquare2 className="h-5 w-5" />,
      match: (path: string) => path.startsWith('/customers'),
    },
    { 
      title: 'CALENDÁRIO', 
      href: '/calendar', 
      icon: <Calendar className="h-5 w-5" />,
      match: (path: string) => path.startsWith('/calendar'),
    },
    { 
      title: 'CONFIGURAÇÕES', 
      href: '/settings', 
      icon: <Settings className="h-5 w-5" />,
      match: (path: string) => path.startsWith('/settings'),
    },
  ];

  return (
    <nav className="p-3 flex-1 overflow-y-auto">
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = item.match(location.pathname);
          console.log(`${item.title} - path: ${location.pathname}, isActive: ${isActive}`);
          
          return (
            <SidebarItem
              key={item.title}
              title={item.title}
              href={item.href}
              icon={item.icon}
              collapsed={collapsed}
              isActive={isActive}
            />
          );
        })}
      </ul>
    </nav>
  );
}
