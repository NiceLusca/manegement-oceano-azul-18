
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
  
  return (
    <Card className="lg:col-span-2 mx-0 my-0 h-full bg-[#0c0e16] border border-[#202330]/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-[#0c0e16] border-b border-[#202330]/50 pb-3">
        <CardTitle className="flex items-center text-lg font-medium text-white">
          Tarefas para {format(date, 'PPP', {
            locale: ptBR
          })}
          {activeFilter && (
            <Badge className="ml-2 bg-[#38B2AC]/20 text-[#38B2AC] border-0" variant="outline">
              {getFilterLabel(activeFilter)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] overflow-auto p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse mx-auto h-6 w-32 rounded-md bg-[#171923] mb-4"></div>
            <div className="animate-pulse mx-auto h-4 w-48 rounded-md bg-[#171923]/70"></div>
          </div>
        ) : tasksForDate.length === 0 ? (
          <div className="text-center py-12 bg-[#0f1117]/50 rounded-lg border border-dashed border-[#202330]/50">
            <p className="text-white/50">Nenhuma tarefa para esta data{activeFilter ? ' com este filtro' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasksForDate.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
