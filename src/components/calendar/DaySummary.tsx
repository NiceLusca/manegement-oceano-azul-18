
import React from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface DaySummaryProps {
  date: Date;
  tasksForDate: Task[];
}

export const DaySummary: React.FC<DaySummaryProps> = ({ date, tasksForDate }) => {
  const getTotalTasks = () => tasksForDate.length;
  const getCompletedTasks = () => tasksForDate.filter(task => task.status === 'completed').length;
  const getUrgentTasks = () => tasksForDate.filter(task => task.priority === 'high').length;
  
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-4">
        {format(date, "dd 'de' MMMM", { locale: ptBR })}
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-secondary/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{getTotalTasks()}</p>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Concluídas</span>
          </div>
          <p className="text-2xl font-bold">{getCompletedTasks()}</p>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Urgentes</span>
          </div>
          <p className="text-2xl font-bold">{getUrgentTasks()}</p>
        </div>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-4">
        {tasksForDate.length > 0 ? (
          <div className="space-y-2">
            {tasksForDate.map(task => (
              <div 
                key={task.id} 
                className="flex items-start gap-2 p-2 rounded hover:bg-secondary/50"
              >
                <div 
                  className={`w-2 h-2 rounded-full mt-1.5 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.status === 'completed' ? 'Concluída' :
                     task.status === 'in-progress' ? 'Em Progresso' :
                     'A Fazer'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma tarefa para este dia
          </p>
        )}
      </ScrollArea>
    </div>
  );
};
