
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
  teamMembers: any[];
  getTasksByAssignee: (id: string) => any[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  teamMembers,
  getTasksByAssignee 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              <span>Produtividade da Equipe</span>
            </div>
            <span className="font-bold">92%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              <span>Metas Atingidas</span>
            </div>
            <span className="font-bold">78%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <span>Tarefas em Atraso</span>
            </div>
            <span className="font-bold">5</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Carga de Trabalho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.filter(member => member.status === 'active').slice(0, 5).map(member => {
            const tasks = getTasksByAssignee(member.id);
            const workload = tasks.length;
            const maxWorkload = 10;
            const percentage = Math.min(Math.round(workload / maxWorkload * 100), 100);
            
            return (
              <div key={member.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-sm text-muted-foreground">{workload} tarefas</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
