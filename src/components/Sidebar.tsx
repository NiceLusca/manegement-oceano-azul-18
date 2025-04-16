
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  Settings,
  PanelLeft,
  Users,
  Home,
  CheckSquare,
  UserSquare2,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  subitems?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const items: SidebarItem[] = [
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
        },
        {
          title: "Tarefas Recorrentes",
          href: "/recurring-tasks",
        },
        {
          title: "Histórico de Atividades",
          href: "/activity-history",
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
    <aside
      className={cn(
        "bg-sidebar-background text-sidebar-foreground h-screen border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 h-14 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
              alt="Oceano Azul" 
              className="h-8 w-auto" 
            />
            <h1 className="font-bold text-xl whitespace-nowrap text-sidebar-primary">
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
          className="h-8 w-8"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )
                }
              >
                {item.icon}
                <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                  {item.title}
                </span>
              </NavLink>
              {item.subitems && !collapsed && (
                <ul className="ml-4 mt-1 space-y-1">
                  {item.subitems.map((subitem) => (
                    <li key={subitem.title}>
                      <NavLink
                        to={subitem.href}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )
                        }
                      >
                        {subitem.icon}
                        <span>{subitem.title}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
