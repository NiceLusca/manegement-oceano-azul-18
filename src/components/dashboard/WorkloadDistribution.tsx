
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WorkloadDistributionProps {
  teamMembers: any[];
  getTasksByAssignee: (id: string) => any[];
}

export const WorkloadDistribution: React.FC<WorkloadDistributionProps> = ({
  teamMembers,
  getTasksByAssignee
}) => {
  return (
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
  );
};
