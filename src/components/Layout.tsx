
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TooltipProvider } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({
  children
}: LayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6 bg-[#0c0e16]">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
