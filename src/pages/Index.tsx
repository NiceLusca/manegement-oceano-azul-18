
import React from 'react';
import { Layout } from '@/components/Layout';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentActivity } from '@/components/RecentActivity';
import { ProjectsOverview } from '@/components/ProjectsOverview';
import { TeamOverview } from '@/components/TeamOverview';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProjectCarousel } from '@/components/dashboard/ProjectCarousel';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { teamMembers, getTasksByAssignee } from '@/data/mock-data';

const Index = () => {
  const [nivelAcesso] = React.useState("admin"); // Em uma aplicação real, viria de um contexto de autenticação

  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <DashboardHeader nivelAcesso={nivelAcesso} />
        
        <DashboardStats />
        
        {isAdmin && <ProjectCarousel />}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsOverview />
          <div className="space-y-6">
            <TeamOverview />
            <RecentActivity />
          </div>
        </div>
        
        {isManager && <DashboardCards 
          teamMembers={teamMembers}
          getTasksByAssignee={getTasksByAssignee}
        />}
        
        {isAdmin && (
          <>
            <MetricsCards 
              teamMembers={teamMembers}
              getTasksByAssignee={getTasksByAssignee}
            />
            
            <div className="flex justify-end mt-8">
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary">
                <Settings className="h-4 w-4" /> Configurar Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
