
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronDown,
  ChevronRight,
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
  const location = useLocation();
  
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

  // Verificar qual seção deve estar expandida com base na rota atual
  React.useEffect(() => {
    const currentPath = location.pathname;
    
    for (const item of items) {
      if (item.subitems) {
        for (const subitem of item.subitems) {
          if (currentPath === subitem.href) {
            setExpandedSection(item.title);
            break;
          }
        }
      }
    }
  }, [location.pathname]);

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
          {items.map((item) => {
            // Verificar se o item ou um de seus subitens está ativo
            const isItemActive = location.pathname === item.href || 
              (item.subitems?.some(subitem => location.pathname === subitem.href));
            
            return (
              <li key={item.title} className="relative">
                {!item.subitems ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            isActive 
                              ? "bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium" 
                              : "hover:bg-sidebar-accent/30 text-sidebar-foreground",
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
                            "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors",
                            isItemActive
                              ? "bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium"
                              : "hover:bg-sidebar-accent/30 text-sidebar-foreground",
                            collapsed && "justify-center p-2"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span className={cn("whitespace-nowrap", collapsed && "hidden")}>
                              {item.title}
                            </span>
                          </div>
                          {!collapsed && item.subitems && (
                            expandedSection === item.title ? 
                              <ChevronDown className="h-4 w-4 text-sidebar-foreground/70" /> :
                              <ChevronRight className="h-4 w-4 text-sidebar-foreground/70" />
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
                        expandedSection === item.title ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      )}>
                        {item.subitems.map((subitem) => (
                          <li key={subitem.title}>
                            <NavLink
                              to={subitem.href}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-2 ml-6 px-3 py-2 rounded-md transition-colors text-sm",
                                  isActive
                                    ? "bg-sidebar-primary/20 text-sidebar-primary font-medium"
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
            );
          })}
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
