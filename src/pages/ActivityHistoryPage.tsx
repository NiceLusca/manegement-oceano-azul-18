
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { TeamActivityHistory } from '@/components/team/TeamActivityHistory';
import { getActivityHistory } from '@/services/teamActivityService';
import { useToast } from '@/components/ui/use-toast';

const ActivityHistoryPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true);
        const activityData = await getActivityHistory(100);
        setActivities(activityData);
      } catch (error) {
        console.error('Erro ao buscar histórico de atividades:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o histórico de atividades',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchActivities();
  }, [toast]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
          <p className="text-muted-foreground">Acompanhe as atividades da sua equipe</p>
        </div>
        
        <TeamActivityHistory activities={activities} loading={loading} />
      </div>
    </Layout>
  );
};

export default ActivityHistoryPage;
