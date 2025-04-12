
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarIcon,
  Settings,
  PanelLeft,
  Users,
  Home,
  FolderKanban,
  UserSquare2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMobileBreakpoint } from '@/hooks/use-mobile';

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const isMobile = useMobileBreakpoint();
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Customers', href: '/customers', icon: UserSquare2 },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (isMobile && !collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "bg-card h-screen border-r transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64",
        isMobile && collapsed ? "fixed left-0 top-0 z-50 shadow-lg" : "",
        isMobile && !collapsed ? "hidden" : ""
      )}
    >
      <div className="flex items-center justify-between p-4 h-14 border-b">
        <h1 className={cn("font-bold text-xl whitespace-nowrap", collapsed && "hidden")}>
          Team Manager
        </h1>
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
