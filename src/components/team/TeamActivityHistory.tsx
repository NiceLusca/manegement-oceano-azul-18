
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface TeamActivityHistoryProps {
  activities: HistoryEntry[];
  loading: boolean;
}

export function TeamActivityHistory({ activities, loading }: TeamActivityHistoryProps) {
  const [activeTab, setActiveTab] = useState('activities');

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
