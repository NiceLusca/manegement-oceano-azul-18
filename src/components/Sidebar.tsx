
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Users, Calendar, Briefcase, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: BarChart2,
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: Briefcase,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={cn(
      "h-screen border-r bg-sidebar p-4 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex justify-between items-center mb-8">
        {!collapsed && (
          <h1 className="text-2xl font-bold text-primary">TeamTango</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center py-3 px-4 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              location.pathname === item.href && "bg-sidebar-accent text-primary font-medium"
            )}
          >
            <item.icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
            {!collapsed && <span className="ml-3">{item.title}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
