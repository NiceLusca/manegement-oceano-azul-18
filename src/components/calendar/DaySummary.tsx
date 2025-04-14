
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarClock, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DaySummaryProps {
  date: Date;
  tasksForDate: Task[];
}

export const DaySummary: React.FC<DaySummaryProps> = ({ date, tasksForDate }) => {
  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Group tasks by priority
  const tasksByPriority = tasksForDate.reduce<Record<string, Task[]>>((acc, task) => {
    const priority = task.priority || 'medium';
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(task);
    return acc;
  }, {});
  
  // Sort priorities in this order: high, medium, low
  const priorityOrder = ['high', 'medium', 'low'];
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium capitalize">{formattedDate}</h3>
          <p className="text-sm text-muted-foreground">
            {tasksForDate.length} {tasksForDate.length === 1 ? 'tarefa' : 'tarefas'}
          </p>
        </div>
        
        <CalendarClock className="h-5 w-5 text-muted-foreground" />
      </div>
      
      {tasksForDate.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>Nenhuma tarefa para este dia</p>
          <Button className="mt-2" variant="outline" size="sm">
            Adicionar Tarefa
          </Button>
        </div>
      ) : (
        <div>
          {priorityOrder.map(priority => {
            const tasks = tasksByPriority[priority] || [];
            if (tasks.length === 0) return null;
            
            return (
              <div key={priority} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getPriorityColor(priority)}>
                    {priority === 'high' ? 'Alta Prioridade' : 
                     priority === 'medium' ? 'Média Prioridade' : 
                     'Baixa Prioridade'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="p-2 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {getStatusIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="mt-3" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
