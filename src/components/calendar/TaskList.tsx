
import React from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  date: Date;
  tasksForDate: Task[];
  loading: boolean;
  activeFilter: string | null;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  date, 
  tasksForDate, 
  loading, 
  activeFilter 
}) => {
  const getFilterLabel = (filter: string | null) => {
    switch (filter) {
      case 'todo': return 'A Fazer';
      case 'in-progress': return 'Em Progresso';
      case 'completed': return 'Concluídas';
      default: return null;
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          Tarefas para {format(date, 'PPP', { locale: ptBR })}
          {activeFilter && (
            <Badge className="ml-2" variant="outline">
              {getFilterLabel(activeFilter)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p>Carregando tarefas...</p>
          </div>
        ) : tasksForDate.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma tarefa para esta data{activeFilter ? ' com este filtro' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasksForDate.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
