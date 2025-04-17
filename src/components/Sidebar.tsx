
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  Settings,
  PanelLeft,
  Users,
  LayoutDashboard,
  CheckSquare,
  UserSquare2,
  ClipboardList,
  BarChart3,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };
  
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
    <aside
      className={cn(
        "bg-sidebar-background text-sidebar-foreground h-screen border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
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
            <h1 className="font-bold text-xl whitespace-nowrap text-oceano-claro">
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
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent/30"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="p-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.title} className="relative">
              {!item.subitems ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "sidebar-item",
                          isActive ? "active" : "",
                          collapsed && "justify-center p-2"
                        )
                      }
                    >
                      {item.icon}
                      <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                        {item.title}
                      </span>
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleSection(item.title)}
                        className={cn(
                          "w-full sidebar-item",
                          expandedSection === item.title
                            ? "bg-sidebar-accent/30"
                            : "",
                          collapsed && "justify-center p-2"
                        )}
                      >
                        {item.icon}
                        <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                          {item.title}
                        </span>
                        {!collapsed && item.subitems && (
                          <svg
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform text-sidebar-foreground/70",
                              expandedSection === item.title && "transform rotate-180"
                            )}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )}
                      </button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                  
                  {item.subitems && !collapsed && (
                    <ul className={cn(
                      "mt-1 space-y-1 overflow-hidden transition-all duration-300",
                      expandedSection === item.title ? "max-h-40" : "max-h-0"
                    )}>
                      {item.subitems.map((subitem) => (
                        <li key={subitem.title}>
                          <NavLink
                            to={subitem.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-2 ml-6 px-3 py-2 rounded-md transition-colors text-sm",
                                isActive
                                  ? "bg-sidebar-primary/30 text-sidebar-primary"
                                  : "hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground"
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
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border mt-auto">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60">
            <p>Oceano Azul • v1.0.0</p>
            <p>© 2025 Todos os direitos reservados</p>
          </div>
        )}
      </div>
    </aside>
  );
}
