
import React, { useEffect, useState } from 'react';
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
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
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

  // Update active item based on current route with debugging
  useEffect(() => {
    const currentPath = location.pathname;
    console.log('SidebarNav - Current path:', currentPath);
    
    // Find matching item
    const matchedItem = items.find(item => {
      // For exact matches like dashboard
      if (item.exactMatch) {
        return item.href === currentPath;
      }
      
      // For other routes
      const isMatch = (currentPath === item.href || 
             (item.href !== '/' && currentPath.startsWith(item.href)));
             
      console.log(`Checking ${item.href}: ${isMatch ? 'ACTIVE' : 'inactive'}`);
      return isMatch;
    });
    
    const activeHref = matchedItem?.href || null;
    console.log('Setting active item to:', activeHref);
    setActiveItem(activeHref);
  }, [location.pathname]);

  return (
    <nav className="p-3 flex-1 overflow-y-auto">
      <ul className="space-y-0.5">
        {items.map((item) => {
          // Check if this item should be active
          const isActive = activeItem === item.href;
          console.log(`Rendering ${item.title}: ${isActive ? 'ACTIVE' : 'inactive'}`);
          
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
