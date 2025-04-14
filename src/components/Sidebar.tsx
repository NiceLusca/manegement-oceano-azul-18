
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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Equipe', href: '/team', icon: Users },
    { name: 'Tarefas', href: '/projects', icon: CheckSquare }, // Changed icon and label
    { name: 'Clientes', href: '/customers', icon: UserSquare2 },
    { name: 'Calendário', href: '/calendar', icon: Calendar },
    { name: 'Tarefas Recorrentes', href: '/recurring-tasks', icon: Clock },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "bg-card h-screen border-r transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 h-14 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
              alt="Oceano Azul" 
              className="h-8 w-auto" 
            />
            <h1 className="font-bold text-xl whitespace-nowrap text-primary">
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
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    collapsed && "justify-center"
                  )
                }
              >
                <link.icon className="h-5 w-5" />
                <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                  {link.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
