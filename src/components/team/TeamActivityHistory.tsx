
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ActivitySkeleton } from './ActivitySkeleton';
import { ActivityEntry } from './ActivityEntry';

interface HistoryEntry {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  action: string;
  details: string;
  created_at: string;
  department_name?: string;
  department_color?: string;
}

export function TeamActivityHistory() {
  const [activities, setActivities] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('team_activity_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities">Atividades da Equipe</TabsTrigger>
            <TabsTrigger value="completed">Tarefas Concluídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="space-y-4 mt-4">
            {loading ? (
              <ActivitySkeleton />
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade encontrada.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map(entry => (
                  <ActivityEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 mt-4">
            <div className="text-center py-8 text-muted-foreground">
              Funcionalidade em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
