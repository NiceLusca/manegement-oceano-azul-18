
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentActivity } from '@/components/RecentActivity';
import { ProjectsOverview } from '@/components/ProjectsOverview';
import { TeamOverview } from '@/components/TeamOverview';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProjectCarousel } from '@/components/dashboard/ProjectCarousel';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { teamMembers, getTasksByAssignee } from '@/data/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';

const Index = () => {
  const { user } = useAuth();
  const [nivelAcesso, setNivelAcesso] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { departments, selectedDepartment, setSelectedDepartment } = useDepartmentFilter();

  // Verificar nível de acesso do usuário
  useEffect(() => {
    const checkAccessLevel = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .rpc('get_user_nivel_acesso', { user_id: user.id });
          
        if (error) throw error;
        
        setNivelAcesso(data || 'user');
      } catch (error) {
        console.error('Erro ao verificar nível de acesso:', error);
        setNivelAcesso('user');
      }
    };
    
    checkAccessLevel();
  }, [user]);

  // Função para atualizar manualmente os dados
  const refreshData = async () => {
    setIsRefreshing(true);
    // Implementar lógica de atualização aqui
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Configurar atualizações em tempo real
  useRealtimeUpdates(
    refreshData,  // callback para tarefas
    refreshData,  // callback para equipe
    refreshData   // callback para clientes
  );

  const isAdmin = nivelAcesso === "Admin" || nivelAcesso === "SuperAdmin";
  const isManager = isAdmin || nivelAcesso === "Supervisor";
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <DashboardHeader nivelAcesso={nivelAcesso || 'user'} />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshData} 
            disabled={isRefreshing} 
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
        
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
          <div className="flex justify-between mt-8">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Tempo real:</span> As informações são atualizadas automaticamente
            </div>
            <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary">
              <Settings className="h-4 w-4" /> Configurar Dashboard
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
