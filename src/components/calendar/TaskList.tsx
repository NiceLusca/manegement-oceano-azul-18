import React from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
interface TaskListProps {
  date: Date;
  tasksForDate: Task[];
  loading: boolean;
  activeFilter: string | null;
  error?: string;
}
export const TaskList: React.FC<TaskListProps> = ({
  date,
  tasksForDate,
  loading,
  activeFilter,
  error
}) => {
  const getFilterLabel = (filter: string | null) => {
    switch (filter) {
      case 'todo':
        return 'A Fazer';
      case 'in-progress':
        return 'Em Progresso';
      case 'completed':
        return 'Concluídas';
      default:
        return null;
    }
  };
  return <Card className="lg:col-span-2 mx-[21px] my-[6px]">
      <CardHeader>
        <CardTitle>
          Tarefas para {format(date, 'PPP', {
          locale: ptBR
        })}
          {activeFilter && <Badge className="ml-2" variant="outline">
              {getFilterLabel(activeFilter)}
            </Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>}
        
        {loading ? <div className="text-center py-8">
            <p>Carregando tarefas...</p>
          </div> : tasksForDate.length === 0 ? <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma tarefa para esta data{activeFilter ? ' com este filtro' : ''}.</p>
          </div> : <div className="space-y-4">
            {tasksForDate.map(task => <TaskCard key={task.id} task={task} />)}
          </div>}
      </CardContent>
    </Card>;
};